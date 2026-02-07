import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";
import { generateBotName, generateBotRating } from "@/lib/bot";
import { getDifficultyForRating } from "@/lib/rating";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "YOUR_SUPABASE_URL";
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Realtime channel for battles
export const createBattleChannel = (matchId: string) => {
  return supabase.channel(`battle:${matchId}`, {
    config: {
      broadcast: { self: true },
    },
  });
};

// Realtime channel for matchmaking
export const createMatchmakingChannel = (userId: string) => {
  return supabase.channel(`matchmaking:${userId}`, {
    config: {
      broadcast: { self: true },
    },
  });
};

// --- Matchmaking (direct DB queries, no Edge Functions) ---

function shuffleAndPick<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

async function selectQuestions(
  userId: string,
  difficulty: number,
  language: string | null = null
) {
  // Get IDs of questions this user has already seen
  const { data: seen } = await supabase
    .from("user_question_history")
    .select("question_id")
    .eq("user_id", userId);

  const seenIds = (seen ?? []).map((s) => s.question_id);

  // Query target difficulty ± 1 to widen the pool (e.g. bronze gets diff 1+2)
  const minDiff = Math.max(1, difficulty - 1);
  const maxDiff = Math.min(4, difficulty + 1);

  // Fetch unseen questions in the difficulty range
  let query = supabase
    .from("questions")
    .select("id")
    .gte("difficulty", minDiff)
    .lte("difficulty", maxDiff)
    .limit(20);

  // Filter by language if specified
  if (language) {
    query = query.ilike("language", language);
  }

  if (seenIds.length > 0) {
    query = query.not("id", "in", `(${seenIds.join(",")})`);
  }

  let { data: questions } = await query;

  // Fallback: allow seen questions in the same difficulty range
  if (!questions || questions.length < 3) {
    const have = (questions ?? []).map((q) => q.id);
    const needed = 20 - have.length;
    let fallbackQuery = supabase
      .from("questions")
      .select("id")
      .gte("difficulty", minDiff)
      .lte("difficulty", maxDiff)
      .limit(needed);
    if (language) {
      fallbackQuery = fallbackQuery.ilike("language", language);
    }
    if (have.length > 0) {
      fallbackQuery = fallbackQuery.not("id", "in", `(${have.join(",")})`);
    }
    const { data: fallback } = await fallbackQuery;
    questions = [...(questions ?? []), ...(fallback ?? [])];
  }

  // Last resort: any questions (drop language filter if needed)
  if (!questions || questions.length === 0) {
    let fallbackQuery = supabase
      .from("questions")
      .select("id")
      .limit(20);
    if (language) {
      fallbackQuery = fallbackQuery.ilike("language", language);
    }
    const { data: any20 } = await fallbackQuery;
    questions = any20 ?? [];
  }

  // Ultimate fallback: any questions regardless of language
  if (!questions || questions.length === 0) {
    const { data: any20 } = await supabase
      .from("questions")
      .select("id")
      .limit(20);
    questions = any20 ?? [];
  }

  return shuffleAndPick(questions, 3);
}

export async function createBotMatch(
  userId: string,
  isRanked: boolean,
  language: string | null = null
) {
  console.log("[Matchmaking] Creating bot match via direct DB...");

  // Get user profile
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("rating")
    .eq("id", userId)
    .single();

  if (profileErr || !profile) throw new Error("Profile not found");

  const difficulty = getDifficultyForRating(profile.rating);
  const botName = generateBotName();
  const botRating = generateBotRating(profile.rating);

  // Select questions (with optional language filter)
  const questions = await selectQuestions(userId, difficulty, language);
  console.log("[Matchmaking] Selected questions:", JSON.stringify(questions));
  if (questions.length === 0) throw new Error("No questions available");

  // Create match
  const { data: match, error: matchErr } = await supabase
    .from("matches")
    .insert({
      player1_id: userId,
      player2_id: null,
      is_bot_match: true,
      player1_score: 0,
      player2_score: 0,
      is_ranked: isRanked,
      started_at: new Date().toISOString(),
      ended_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (matchErr || !match) throw new Error("Failed to create match: " + matchErr?.message);

  // Create rounds
  const rounds = questions.map((q, i) => ({
    match_id: match.id,
    round_number: i + 1,
    question_id: q.id,
  }));
  const { error: roundsErr } = await supabase.from("match_rounds").insert(rounds);
  if (roundsErr) {
    console.error("[Matchmaking] Failed to insert rounds:", roundsErr);
    throw new Error("Failed to create rounds: " + roundsErr.message);
  }

  // Record question history (non-critical, log but don't throw)
  const history = questions.map((q) => ({
    user_id: userId,
    question_id: q.id,
  }));
  const { error: historyErr } = await supabase
    .from("user_question_history")
    .upsert(history, { onConflict: "user_id,question_id" });
  if (historyErr) {
    console.warn("[Matchmaking] Failed to record question history:", historyErr);
  }

  console.log("[Matchmaking] Bot match created:", match.id);

  return {
    status: "matched" as const,
    match_id: match.id,
    opponent_username: botName,
    opponent_rating: botRating,
    is_bot_match: true,
  };
}

type MatchQueueResult =
  | { status: "matched"; match_id: string; opponent_username: string; opponent_rating: number }
  | { status: "queued" };

export async function joinMatchQueue(
  userId: string,
  isRanked: boolean,
  language: string | null = null
): Promise<MatchQueueResult> {
  console.log("[Matchmaking] Joining queue via direct DB...");

  const { data: profile } = await supabase
    .from("profiles")
    .select("rating")
    .eq("id", userId)
    .single();

  if (!profile) throw new Error("Profile not found");

  // Remove any existing queue entry
  await supabase.from("match_queue").delete().eq("user_id", userId);

  // Search for an opponent within ±100 rating
  const { data: opponents } = await supabase
    .from("match_queue")
    .select("*")
    .gte("rating", profile.rating - 100)
    .lte("rating", profile.rating + 100)
    .neq("user_id", userId)
    .order("joined_at", { ascending: true })
    .limit(1);

  if (opponents && opponents.length > 0) {
    const opp = opponents[0];

    // Atomically remove opponent from queue (by row id to prevent races)
    const { data: deleted } = await supabase
      .from("match_queue")
      .delete()
      .eq("id", opp.id)
      .select("id");

    // If someone else already grabbed this opponent, fall through to queue
    if (deleted && deleted.length > 0) {
      console.log("[Matchmaking] Matched with human:", opp.user_id);

      const difficulty = getDifficultyForRating(profile.rating);
      const questions = await selectQuestions(userId, difficulty, language);
      if (questions.length === 0) throw new Error("No questions available");

      // Create match
      const { data: match, error: matchErr } = await supabase
        .from("matches")
        .insert({
          player1_id: userId,
          player2_id: opp.user_id,
          is_bot_match: false,
          player1_score: 0,
          player2_score: 0,
          is_ranked: isRanked,
          started_at: new Date().toISOString(),
          ended_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (matchErr || !match) throw new Error("Failed to create match: " + matchErr?.message);

      // Create rounds
      const rounds = questions.map((q, i) => ({
        match_id: match.id,
        round_number: i + 1,
        question_id: q.id,
      }));
      const { error: roundsErr } = await supabase.from("match_rounds").insert(rounds);
      if (roundsErr) throw new Error("Failed to create rounds: " + roundsErr.message);

      // Record question history for both players
      const history = questions.flatMap((q) => [
        { user_id: userId, question_id: q.id },
        { user_id: opp.user_id, question_id: q.id },
      ]);
      await supabase
        .from("user_question_history")
        .upsert(history, { onConflict: "user_id,question_id" })
        .then(({ error }) => {
          if (error) console.warn("[Matchmaking] History upsert warning:", error);
        });

      // Fetch both profiles for display
      const { data: oppProfile } = await supabase
        .from("profiles")
        .select("username, rating")
        .eq("id", opp.user_id)
        .single();

      const { data: myProfile } = await supabase
        .from("profiles")
        .select("username, rating")
        .eq("id", userId)
        .single();

      // Broadcast match_found to the waiting opponent
      const channel = supabase.channel(`matchmaking:${opp.user_id}`);
      await channel.send({
        type: "broadcast",
        event: "match_found",
        payload: {
          match_id: match.id,
          opponent_username: myProfile?.username ?? "Opponent",
          opponent_rating: myProfile?.rating ?? profile.rating,
        },
      });
      supabase.removeChannel(channel);

      return {
        status: "matched" as const,
        match_id: match.id,
        opponent_username: oppProfile?.username ?? "Opponent",
        opponent_rating: oppProfile?.rating ?? opp.rating,
      };
    }
  }

  // No opponent found (or race lost) — add to queue
  await supabase.from("match_queue").insert({
    user_id: userId,
    rating: profile.rating,
    is_ranked: isRanked,
  });

  console.log("[Matchmaking] Queued.");
  return { status: "queued" };
}

export async function leaveMatchQueue(userId: string) {
  await supabase.from("match_queue").delete().eq("user_id", userId);
  return { status: "left_queue" as const };
}

// --- Battle (direct DB queries) ---

export async function startBattle(matchId: string, userId: string) {
  console.log("[Battle] Starting battle via direct DB...");

  // Fetch match
  const { data: match, error: matchErr } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (matchErr || !match) throw new Error("Match not found");

  // Fetch rounds with questions
  const { data: rounds } = await supabase
    .from("match_rounds")
    .select("id, round_number, question_id, questions(*)")
    .eq("match_id", matchId)
    .order("round_number", { ascending: true });

  if (!rounds || rounds.length === 0) throw new Error("No rounds found");

  // Fetch player profiles
  const { data: player1 } = await supabase
    .from("profiles")
    .select("id, username, rating, tier")
    .eq("id", match.player1_id)
    .single();

  let player2 = null;
  if (match.player2_id) {
    const { data } = await supabase
      .from("profiles")
      .select("id, username, rating, tier")
      .eq("id", match.player2_id)
      .single();
    player2 = data;
  }

  // Set round_started_at on round 1
  await supabase
    .from("match_rounds")
    .update({ round_started_at: new Date().toISOString() })
    .eq("match_id", matchId)
    .eq("round_number", 1);

  // Build questions (answers withheld for non-bot matches)
  const questions = rounds.map((r: any) => {
    const q = r.questions;
    return {
      round_number: r.round_number,
      round_id: r.id,
      question: {
        id: q.id,
        code_snippet: q.code_snippet,
        question_text: q.question_text,
        options: q.options,
        language: q.language,
        // For bot matches, include answers so client can process locally
        ...(match.is_bot_match
          ? { correct_answer: q.correct_answer, explanation: q.explanation }
          : {}),
      },
    };
  });

  console.log("[Battle] Battle data loaded.");

  return {
    match_id: matchId,
    is_bot_match: match.is_bot_match,
    is_ranked: match.is_ranked,
    player1,
    player2,
    questions,
  };
}

export async function submitBattleAnswer(
  matchId: string,
  userId: string,
  roundNumber: number,
  answer: number,
  clientTimeMs: number
) {
  // Record answer in DB
  const { data: match } = await supabase
    .from("matches")
    .select("player1_id, is_bot_match")
    .eq("id", matchId)
    .single();

  if (!match) throw new Error("Match not found");

  const isPlayer1 = match.player1_id === userId;
  const updateData: Record<string, unknown> = {};

  if (isPlayer1) {
    updateData.player1_answer = answer;
    updateData.player1_time_ms = clientTimeMs;
  } else {
    updateData.player2_answer = answer;
    updateData.player2_time_ms = clientTimeMs;
  }

  await supabase
    .from("match_rounds")
    .update(updateData)
    .eq("match_id", matchId)
    .eq("round_number", roundNumber);

  // For human matches, broadcast that we answered
  if (!match.is_bot_match) {
    const channel = supabase.channel(`battle:${matchId}`);
    await channel.send({
      type: "broadcast",
      event: "player_answered",
      payload: { user_id: userId, round_number: roundNumber },
    });
    supabase.removeChannel(channel);
  }

  return { status: "answer_recorded" };
}

// --- Human match helpers ---

export async function fetchRoundResult(matchId: string, roundNumber: number) {
  const { data, error } = await supabase
    .from("match_rounds")
    .select("*, questions(correct_answer, explanation)")
    .eq("match_id", matchId)
    .eq("round_number", roundNumber)
    .single();
  if (error || !data) throw new Error("Round not found");
  return data;
}

export async function checkBothAnswered(matchId: string, roundNumber: number) {
  const { data } = await supabase
    .from("match_rounds")
    .select("player1_answer, player2_answer")
    .eq("match_id", matchId)
    .eq("round_number", roundNumber)
    .single();
  return data?.player1_answer !== null && data?.player2_answer !== null;
}
