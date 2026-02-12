import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";
import { corsHeaders } from "../_shared/cors.ts";
import {
  generateBotAnswer,
  getBotConfigForDifficulty,
} from "../_shared/bot.ts";
import {
  calculateRatingChange,
  applyFloorProtection,
  getTierForRating,
  getDifficultyForRating,
} from "../_shared/rating.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "No authorization header" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

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
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const body = await req.json();

    switch (body.action) {
      case "start_battle":
        return await handleStartBattle(supabase, body.match_id, user.id);
      case "submit_answer":
        return await handleSubmitAnswer(
          supabase,
          body.match_id,
          user.id,
          body.round_number,
          body.answer,
          body.client_time_ms
        );
      case "award_league_points":
        return await handleAwardLeaguePoints(
          supabase,
          body.match_id,
          user.id
        );
      default:
        return jsonResponse({ error: "Unknown action" }, 400);
    }
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});

async function handleStartBattle(
  supabase: ReturnType<typeof createClient>,
  matchId: string,
  userId: string
) {
  // Fetch match
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (matchError || !match) {
    return jsonResponse({ error: "Match not found" }, 404);
  }

  // Verify user is a participant
  if (match.player1_id !== userId && match.player2_id !== userId) {
    return jsonResponse({ error: "Not a participant" }, 403);
  }

  // Fetch rounds with questions
  const { data: rounds } = await supabase
    .from("match_rounds")
    .select("*, questions(*)")
    .eq("match_id", matchId)
    .order("round_number", { ascending: true });

  if (!rounds || rounds.length === 0) {
    return jsonResponse({ error: "No rounds found" }, 404);
  }

  // Fetch player profiles
  const { data: player1Profile } = await supabase
    .from("profiles")
    .select("id, username, rating, tier")
    .eq("id", match.player1_id)
    .single();

  let player2Profile = null;
  if (match.player2_id) {
    const { data } = await supabase
      .from("profiles")
      .select("id, username, rating, tier")
      .eq("id", match.player2_id)
      .single();
    player2Profile = data;
  }

  // Set round_started_at on round 1
  await supabase
    .from("match_rounds")
    .update({ round_started_at: new Date().toISOString() })
    .eq("match_id", matchId)
    .eq("round_number", 1);

  // Build questions array with answers withheld
  const questions = rounds.map((r: Record<string, unknown>) => {
    const q = r.questions as Record<string, unknown>;
    return {
      round_number: r.round_number,
      round_id: r.id,
      question: {
        id: q.id,
        question_type: q.question_type ?? "mcq",
        code_snippet: q.code_snippet,
        question_text: q.question_text,
        options: q.options,
        language: q.language,
        // correct_answer and explanation WITHHELD
      },
    };
  });

  return jsonResponse({
    match_id: matchId,
    is_bot_match: match.is_bot_match,
    is_ranked: match.is_ranked,
    player1: player1Profile,
    player2: player2Profile,
    questions,
  });
}

async function handleSubmitAnswer(
  supabase: ReturnType<typeof createClient>,
  matchId: string,
  userId: string,
  roundNumber: number,
  answer: number,
  clientTimeMs: number
) {
  // Fetch match
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (matchError || !match) {
    return jsonResponse({ error: "Match not found" }, 404);
  }

  const isPlayer1 = match.player1_id === userId;
  if (!isPlayer1 && match.player2_id !== userId) {
    return jsonResponse({ error: "Not a participant" }, 403);
  }

  // Fetch the round
  const { data: round, error: roundError } = await supabase
    .from("match_rounds")
    .select("*, questions(*)")
    .eq("match_id", matchId)
    .eq("round_number", roundNumber)
    .single();

  if (roundError || !round) {
    return jsonResponse({ error: "Round not found" }, 404);
  }

  // Calculate server-side time
  const serverTimeMs = round.round_started_at
    ? Date.now() - new Date(round.round_started_at).getTime()
    : clientTimeMs;

  // Record answer
  const updateData: Record<string, unknown> = {};
  if (isPlayer1) {
    if (round.player1_answer !== null) {
      return jsonResponse({ error: "Already answered" }, 400);
    }
    updateData.player1_answer = answer;
    updateData.player1_time_ms = serverTimeMs;
  } else {
    if (round.player2_answer !== null) {
      return jsonResponse({ error: "Already answered" }, 400);
    }
    updateData.player2_answer = answer;
    updateData.player2_time_ms = serverTimeMs;
  }

  await supabase
    .from("match_rounds")
    .update(updateData)
    .eq("id", round.id);

  // For bot matches: generate bot answer immediately
  if (match.is_bot_match && isPlayer1) {
    const question = round.questions as Record<string, unknown>;
    const difficulty = (question.difficulty as number) ?? 1;
    const config = getBotConfigForDifficulty(difficulty);
    const botAnswer = generateBotAnswer(
      question.correct_answer as number,
      (question.options as unknown[]).length,
      config
    );

    await supabase
      .from("match_rounds")
      .update({
        player2_answer: botAnswer.answer,
        player2_time_ms: botAnswer.timeMs,
      })
      .eq("id", round.id);

    // Re-fetch round with both answers
    const { data: updatedRound } = await supabase
      .from("match_rounds")
      .select("*, questions(*)")
      .eq("id", round.id)
      .single();

    if (updatedRound) {
      return await processRoundResult(supabase, match, updatedRound, matchId);
    }
  }

  // For human matches: check if both have answered
  const { data: latestRound } = await supabase
    .from("match_rounds")
    .select("*, questions(*)")
    .eq("id", round.id)
    .single();

  if (
    latestRound &&
    latestRound.player1_answer !== null &&
    latestRound.player2_answer !== null
  ) {
    return await processRoundResult(supabase, match, latestRound, matchId);
  }

  // Only one player answered so far — broadcast pressure
  const channel = supabase.channel(`battle:${matchId}`);
  await channel.send({
    type: "broadcast",
    event: "opponent_answered",
    payload: { user_id: userId },
  });
  supabase.removeChannel(channel);

  return jsonResponse({ status: "answer_recorded" });
}

async function processRoundResult(
  supabase: ReturnType<typeof createClient>,
  match: Record<string, unknown>,
  round: Record<string, unknown>,
  matchId: string
) {
  const question = round.questions as Record<string, unknown>;
  const correctAnswer = question.correct_answer as number;
  const roundNumber = round.round_number as number;

  const p1Answer = round.player1_answer as number;
  const p2Answer = round.player2_answer as number;
  const p1Time = round.player1_time_ms as number;
  const p2Time = round.player2_time_ms as number;

  const p1Correct = p1Answer === correctAnswer;
  const p2Correct = p2Answer === correctAnswer;

  // Determine round winner
  let roundWinnerId: string | null = null;
  if (p1Correct && !p2Correct) {
    roundWinnerId = match.player1_id as string;
  } else if (!p1Correct && p2Correct) {
    roundWinnerId = (match.player2_id as string) ?? "bot";
  }
  // Both correct or both wrong = tie (no speed tiebreaker)

  // Update round with winner
  await supabase
    .from("match_rounds")
    .update({ round_winner_id: roundWinnerId })
    .eq("id", round.id as string);

  // Count scores (correct answers, not round wins)
  const { data: allRounds } = await supabase
    .from("match_rounds")
    .select("player1_answer, player2_answer, questions(correct_answer)")
    .eq("match_id", matchId)
    .not("player1_answer", "is", null);

  let p1Score = 0;
  let p2Score = 0;
  for (const r of allRounds ?? []) {
    const correct = (r.questions as Record<string, unknown>)?.correct_answer;
    if (r.player1_answer === correct) p1Score++;
    if (r.player2_answer === correct) p2Score++;
  }

  // Update match scores
  await supabase
    .from("matches")
    .update({ player1_score: p1Score, player2_score: p2Score })
    .eq("id", matchId);

  // Check if match is over (first to 2 wins)
  const matchOver = roundNumber >= 5;

  const channel = supabase.channel(`battle:${matchId}`);

  // Broadcast round result
  await channel.send({
    type: "broadcast",
    event: "round_result",
    payload: {
      round_number: roundNumber,
      correct_answer: correctAnswer,
      explanation: question.explanation,
      player1_answer: p1Answer,
      player2_answer: p2Answer,
      player1_time_ms: p1Time,
      player2_time_ms: p2Time,
      round_winner_id: roundWinnerId,
      player1_score: p1Score,
      player2_score: p2Score,
    },
  });

  if (matchOver) {
    // Determine match winner
    let winnerId: string | null = null;
    if (p1Score > p2Score) winnerId = match.player1_id as string;
    else if (p2Score > p1Score)
      winnerId = (match.player2_id as string) ?? "bot";

    const isComeback =
      (winnerId === match.player1_id && p2Score === 2 && p1Score === 3) ||
      (winnerId !== match.player1_id && p1Score === 2 && p2Score === 3);

    // Calculate rating changes
    let p1RatingChange = 0;
    let p2RatingChange = 0;

    if (match.is_ranked) {
      const { data: p1Profile } = await supabase
        .from("profiles")
        .select("rating")
        .eq("id", match.player1_id as string)
        .single();

      const p1Rating = p1Profile?.rating ?? 0;
      let p2Rating = 0;

      if (match.player2_id) {
        const { data: p2Profile } = await supabase
          .from("profiles")
          .select("rating")
          .eq("id", match.player2_id as string)
          .single();
        p2Rating = p2Profile?.rating ?? 0;
      } else {
        // Bot rating is close to user's
        p2Rating = p1Rating + Math.floor(Math.random() * 101) - 50;
      }

      if (winnerId === match.player1_id) {
        const { winnerDelta, loserDelta } = calculateRatingChange({
          winnerRating: p1Rating,
          loserRating: p2Rating,
          isComeback,
          isRanked: true,
        });
        p1RatingChange = winnerDelta;
        p2RatingChange = loserDelta;
      } else if (winnerId) {
        const { winnerDelta, loserDelta } = calculateRatingChange({
          winnerRating: p2Rating,
          loserRating: p1Rating,
          isComeback,
          isRanked: true,
        });
        p2RatingChange = winnerDelta;
        p1RatingChange = loserDelta;
      }

      // Reduce bot match rating rewards to 60%
      if (match.is_bot_match) {
        if (p1RatingChange > 0) p1RatingChange = Math.round(p1RatingChange * 0.6);
        if (p2RatingChange > 0) p2RatingChange = Math.round(p2RatingChange * 0.6);
      }

      // Update player 1 profile
      const newP1Rating = applyFloorProtection(
        p1Rating,
        p1Rating + p1RatingChange
      );
      const { data: p1Current } = await supabase
        .from("profiles")
        .select("wins, losses")
        .eq("id", match.player1_id as string)
        .single();

      const p1Update: Record<string, unknown> = {
        rating: newP1Rating,
        tier: getTierForRating(newP1Rating),
      };
      if (winnerId === match.player1_id) p1Update.wins = (p1Current?.wins ?? 0) + 1;
      else if (winnerId !== null) p1Update.losses = (p1Current?.losses ?? 0) + 1;
      // draw: neither incremented

      await supabase
        .from("profiles")
        .update(p1Update)
        .eq("id", match.player1_id as string);

      // Update player 2 profile (if human)
      if (match.player2_id) {
        const newP2Rating = applyFloorProtection(
          p2Rating,
          p2Rating + p2RatingChange
        );
        const { data: p2Current } = await supabase
          .from("profiles")
          .select("wins, losses")
          .eq("id", match.player2_id as string)
          .single();

        const p2Update: Record<string, unknown> = {
          rating: newP2Rating,
          tier: getTierForRating(newP2Rating),
        };
        if (winnerId === match.player2_id) p2Update.wins = (p2Current?.wins ?? 0) + 1;
        else if (winnerId !== null) p2Update.losses = (p2Current?.losses ?? 0) + 1;
        // draw: neither incremented

        await supabase
          .from("profiles")
          .update(p2Update)
          .eq("id", match.player2_id as string);
      }
    }

    // Finalize match
    await supabase
      .from("matches")
      .update({
        winner_id: winnerId === "bot" ? null : winnerId,
        player1_score: p1Score,
        player2_score: p2Score,
        player1_rating_change: p1RatingChange,
        player2_rating_change: p2RatingChange,
        ended_at: new Date().toISOString(),
      })
      .eq("id", matchId);

    // Award league points for ranked matches
    if (match.is_ranked) {
      const LEAGUE_WIN = 3;
      const LEAGUE_DRAW = 2;
      const LEAGUE_LOSS = 1;

      // Monday of current week as YYYY-MM-DD
      const now = new Date();
      const day = now.getDay();
      const diff = day === 0 ? 6 : day - 1;
      const monday = new Date(now);
      monday.setDate(now.getDate() - diff);
      const weekStart = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;

      // Player 1
      const p1Points = winnerId === match.player1_id ? LEAGUE_WIN
        : winnerId === null ? LEAGUE_DRAW : LEAGUE_LOSS;
      const { data: p1Prof } = await supabase
        .from("profiles")
        .select("tier")
        .eq("id", match.player1_id as string)
        .single();
      await upsertLeagueMembership(
        supabase,
        match.player1_id as string,
        weekStart,
        p1Points,
        p1Prof?.tier ?? "bronze"
      );

      // Player 2 (human only)
      if (match.player2_id) {
        const p2Points = winnerId === match.player2_id ? LEAGUE_WIN
          : winnerId === null ? LEAGUE_DRAW : LEAGUE_LOSS;
        const { data: p2Prof } = await supabase
          .from("profiles")
          .select("tier")
          .eq("id", match.player2_id as string)
          .single();
        await upsertLeagueMembership(
          supabase,
          match.player2_id as string,
          weekStart,
          p2Points,
          p2Prof?.tier ?? "bronze"
        );
      }
    }

    // Broadcast battle end
    await channel.send({
      type: "broadcast",
      event: "battle_end",
      payload: {
        winner_id: winnerId,
        player1_score: p1Score,
        player2_score: p2Score,
        player1_rating_change: p1RatingChange,
        player2_rating_change: p2RatingChange,
        is_comeback: isComeback,
      },
    });

    supabase.removeChannel(channel);

    return jsonResponse({
      status: "match_ended",
      round_result: {
        round_number: round.round_number,
        correct_answer: correctAnswer,
        explanation: question.explanation,
        round_winner_id: roundWinnerId,
      },
      match_result: {
        winner_id: winnerId,
        player1_score: p1Score,
        player2_score: p2Score,
        player1_rating_change: p1RatingChange,
        player2_rating_change: p2RatingChange,
        is_comeback: isComeback,
      },
    });
  }

  // Match not over — set round_started_at for next round
  const nextRound = roundNumber + 1;
  await supabase
    .from("match_rounds")
    .update({ round_started_at: new Date().toISOString() })
    .eq("match_id", matchId)
    .eq("round_number", nextRound);

  // Broadcast next round
  await channel.send({
    type: "broadcast",
    event: "next_round",
    payload: { next_round: nextRound },
  });

  supabase.removeChannel(channel);

  return jsonResponse({
    status: "round_completed",
    round_result: {
      round_number: round.round_number,
      correct_answer: correctAnswer,
      explanation: question.explanation,
      round_winner_id: roundWinnerId,
      player1_score: p1Score,
      player2_score: p2Score,
    },
  });
}

async function handleAwardLeaguePoints(
  supabase: ReturnType<typeof createClient>,
  matchId: string,
  userId: string
) {
  // Fetch the match to verify it's ranked and the user is a participant
  const { data: match, error: matchErr } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (matchErr || !match) {
    return jsonResponse({ error: "Match not found" }, 404);
  }

  if (match.player1_id !== userId && match.player2_id !== userId) {
    return jsonResponse({ error: "Not a participant" }, 403);
  }

  if (!match.is_ranked) {
    return jsonResponse({ status: "not_ranked" });
  }

  if (!match.ended_at) {
    return jsonResponse({ error: "Match not ended" }, 400);
  }

  // Compute week start
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  const weekStart = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;

  const LEAGUE_WIN = 3;
  const LEAGUE_DRAW = 2;
  const LEAGUE_LOSS = 1;

  const isDraw = match.winner_id === null && !match.forfeited_by;
  const isWinner = match.winner_id === userId;
  const points = isWinner ? LEAGUE_WIN : isDraw ? LEAGUE_DRAW : LEAGUE_LOSS;

  const { data: prof } = await supabase
    .from("profiles")
    .select("tier")
    .eq("id", userId)
    .single();

  await upsertLeagueMembership(
    supabase,
    userId,
    weekStart,
    points,
    prof?.tier ?? "bronze"
  );

  return jsonResponse({ status: "awarded", points });
}

async function upsertLeagueMembership(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  weekStart: string,
  points: number,
  tier: string
) {
  const { data: existing } = await supabase
    .from("league_memberships")
    .select("id, points")
    .eq("user_id", userId)
    .eq("week_start", weekStart)
    .single();

  if (existing) {
    await supabase
      .from("league_memberships")
      .update({ points: existing.points + points, league_tier: tier })
      .eq("id", existing.id);
  } else {
    await supabase.from("league_memberships").insert({
      user_id: userId,
      league_tier: tier,
      league_group: 1,
      week_start: weekStart,
      points,
    });
  }
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
