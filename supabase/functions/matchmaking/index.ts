import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";
import { corsHeaders } from "../_shared/cors.ts";
import {
  generateBotName,
  generateBotRating,
  getBotConfigForDifficulty,
} from "../_shared/bot.ts";
import { getDifficultyForRating } from "../_shared/rating.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify the user's JWT
    const token = authHeader.replace("Bearer ", "");
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, is_ranked, language } = await req.json();

    switch (action) {
      case "join_queue":
        return await handleJoinQueue(supabase, user.id, is_ranked ?? true, language ?? null);
      case "create_bot_match":
        return await handleCreateBotMatch(supabase, user.id, is_ranked ?? true, language ?? null);
      case "leave_queue":
        return await handleLeaveQueue(supabase, user.id);
      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleJoinQueue(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  isRanked: boolean,
  language: string | null
) {
  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("rating")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    return jsonResponse({ error: "Profile not found" }, 404);
  }

  // Remove any existing queue entry for this user
  await supabase.from("match_queue").delete().eq("user_id", userId);

  // Try to find an opponent within ±100 rating
  const { data: opponents } = await supabase
    .from("match_queue")
    .select("*")
    .gte("rating", profile.rating - 100)
    .lte("rating", profile.rating + 100)
    .neq("user_id", userId)
    .order("joined_at", { ascending: true })
    .limit(1);

  if (opponents && opponents.length > 0) {
    const opponent = opponents[0];

    // Guard: check if opponent is stale (already in a match).
    // Two checks cover all cases:
    // 1. Any match started after they joined queue (covers completed/forfeited matches)
    // 2. Any currently active match with no winner (covers in-progress matches even if
    //    started slightly before joined_at due to eager bot match creation on old clients)
    const activeCutoff = new Date(Date.now() - 600000).toISOString();
    const [{ count: staleCount }, { count: activeCount }] = await Promise.all([
      supabase
        .from("matches")
        .select("id", { count: "exact", head: true })
        .or(`player1_id.eq.${opponent.user_id},player2_id.eq.${opponent.user_id}`)
        .gte("started_at", opponent.joined_at),
      supabase
        .from("matches")
        .select("id", { count: "exact", head: true })
        .or(`player1_id.eq.${opponent.user_id},player2_id.eq.${opponent.user_id}`)
        .gte("started_at", activeCutoff)
        .is("winner_id", null)
        .is("forfeited_by", null),
    ]);

    if ((staleCount ?? 0) > 0 || (activeCount ?? 0) > 0) {
      // Opponent is stale or in an active match — remove and queue ourselves instead.
      await supabase.from("match_queue").delete().eq("id", opponent.id);
      const { error: insertError } = await supabase.from("match_queue").insert({
        user_id: userId,
        rating: profile.rating,
        is_ranked: isRanked,
      });
      if (insertError) {
        return jsonResponse({ error: "Failed to join queue" }, 500);
      }
      return jsonResponse({ status: "queued" });
    }

    // Remove opponent from queue
    await supabase.from("match_queue").delete().eq("id", opponent.id);

    // Create the match
    const matchData = await createMatch(
      supabase,
      userId,
      opponent.user_id,
      profile.rating,
      isRanked,
      false,
      language
    );

    if (!matchData) {
      return jsonResponse({ error: "Failed to create match" }, 500);
    }

    // Fetch opponent profile for broadcast
    const { data: opponentProfile } = await supabase
      .from("profiles")
      .select("username, rating")
      .eq("id", opponent.user_id)
      .single();

    const { data: userProfile } = await supabase
      .from("profiles")
      .select("username, rating")
      .eq("id", userId)
      .single();

    // Broadcast match_found to both players
    const channel = supabase.channel(`matchmaking:${opponent.user_id}`);
    await channel.send({
      type: "broadcast",
      event: "match_found",
      payload: {
        match_id: matchData.id,
        opponent_username: userProfile?.username ?? "Unknown",
        opponent_rating: userProfile?.rating ?? 0,
      },
    });
    supabase.removeChannel(channel);

    return jsonResponse({
      status: "matched",
      match_id: matchData.id,
      opponent_username: opponentProfile?.username ?? "Unknown",
      opponent_rating: opponentProfile?.rating ?? 0,
    });
  }

  // No opponent found — add to queue
  const { error: insertError } = await supabase.from("match_queue").insert({
    user_id: userId,
    rating: profile.rating,
    is_ranked: isRanked,
  });

  if (insertError) {
    return jsonResponse({ error: "Failed to join queue" }, 500);
  }

  return jsonResponse({ status: "queued" });
}

async function handleCreateBotMatch(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  isRanked: boolean,
  language: string | null
) {
  // Remove from queue
  await supabase.from("match_queue").delete().eq("user_id", userId);

  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("rating")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    return jsonResponse({ error: "Profile not found" }, 404);
  }

  const botName = generateBotName();
  const botRating = generateBotRating(profile.rating);

  const matchData = await createMatch(
    supabase,
    userId,
    null,
    profile.rating,
    isRanked,
    true,
    language
  );

  if (!matchData) {
    return jsonResponse({ error: "Failed to create bot match" }, 500);
  }

  return jsonResponse({
    status: "matched",
    match_id: matchData.id,
    opponent_username: botName,
    opponent_rating: botRating,
    is_bot_match: true,
  });
}

async function handleLeaveQueue(
  supabase: ReturnType<typeof createClient>,
  userId: string
) {
  await supabase.from("match_queue").delete().eq("user_id", userId);
  return jsonResponse({ status: "left_queue" });
}

async function createMatch(
  supabase: ReturnType<typeof createClient>,
  player1Id: string,
  player2Id: string | null,
  playerRating: number,
  isRanked: boolean,
  isBotMatch: boolean,
  language: string | null
) {
  const difficulty = getDifficultyForRating(playerRating);

  // Get seen question IDs for this player
  const { data: seenIds } = await supabase
    .from("user_question_history")
    .select("question_id")
    .eq("user_id", player1Id);

  const seenQuestionIds = (seenIds ?? []).map((s: { question_id: string }) => s.question_id);

  // Select 3 random questions with type+language diversity via DB function
  const { data: questions } = await supabase.rpc("select_match_questions", {
    p_difficulty: difficulty,
    p_seen_ids: seenQuestionIds,
    p_language: language,
  });

  if (!questions || questions.length === 0) {
    return null;
  }

  // Create match record
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .insert({
      player1_id: player1Id,
      player2_id: player2Id,
      is_bot_match: isBotMatch,
      player1_score: 0,
      player2_score: 0,
      is_ranked: isRanked,
      started_at: new Date().toISOString(),
      ended_at: new Date().toISOString(), // placeholder, updated when match ends
    })
    .select("id")
    .single();

  if (matchError || !match) {
    return null;
  }

  // Create match rounds
  const rounds = questions.map((q, i) => ({
    match_id: match.id,
    round_number: i + 1,
    question_id: q.id,
  }));

  await supabase.from("match_rounds").insert(rounds);

  // Record question history for the user
  const historyEntries = questions.map((q) => ({
    user_id: player1Id,
    question_id: q.id,
  }));
  await supabase.from("user_question_history").upsert(historyEntries, {
    onConflict: "user_id,question_id",
  });

  return match;
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
