import { useState, useEffect, useCallback, useRef } from "react";
import {
  supabase,
  createBattleChannel,
  startBattle,
  submitBattleAnswer,
  fetchRoundResult,
  checkBothAnswered,
  awardLeaguePoints,
  forfeitMatch,
} from "@/lib/supabase";
import {
  calculateRatingChange,
  applyFloorProtection,
  getTierForRating,
} from "@/lib/rating";
import { RealtimeChannel } from "@supabase/supabase-js";
import { calculateStreakUpdate } from "@/lib/streak";
import { calculateMatchXP, getLevelFromXP } from "@/lib/xp";

export type BattlePhase =
  | "loading"
  | "countdown"
  | "question"
  | "result"
  | "match_end";

interface BattlePlayer {
  id: string;
  username: string;
  rating: number;
  score: number;
}

interface BattleQuestion {
  id: string;
  code_snippet: string;
  question_text: string;
  options: string[];
  language?: string;
  correct_answer?: number;
  explanation?: string;
}

interface RoundResult {
  round_number: number;
  correct_answer: number;
  explanation: string;
  player_answer: number;
  player_time_ms: number;
  opponent_answer: number;
  opponent_time_ms: number;
  round_winner: "player" | "opponent" | "tie";
  player_score: number;
  opponent_score: number;
}

interface MatchResult {
  winner: "player" | "opponent" | "tie";
  player_score: number;
  opponent_score: number;
  rating_change: number;
  is_comeback: boolean;
  is_forfeit: boolean;
  xp_earned: number;
  new_rating: number;
  new_level: number;
  leveled_up: boolean;
  promoted_to: "silver" | "gold" | "diamond" | null;
  old_streak: number;
  new_streak: number;
}

interface UseBattleProps {
  matchId: string;
  userId: string;
  opponentUsername?: string;
  opponentRating?: number;
  isBotMatch?: boolean;
}

// Bot answer generation (inline to avoid import issues)
function generateBotAnswer(
  correctAnswer: number,
  totalOptions: number,
  difficulty: number
): { answer: number; timeMs: number } {
  const accuracyMap: Record<number, number> = {
    1: 0.87,
    2: 0.82,
    3: 0.77,
    4: 0.72,
  };
  const accuracy = accuracyMap[difficulty] ?? 0.8;
  const isCorrect = Math.random() < accuracy;

  let answer: number;
  if (isCorrect) {
    answer = correctAnswer;
  } else {
    do {
      answer = Math.floor(Math.random() * totalOptions);
    } while (answer === correctAnswer);
  }

  const minTime = 2000 + difficulty * 1000;
  const maxTime = 5000 + difficulty * 2000;
  const timeMs = minTime + Math.floor(Math.random() * (maxTime - minTime));

  return { answer, timeMs };
}

// Pure function: compute round result from answers
function computeRoundResult(
  roundNumber: number,
  correctAnswer: number,
  explanation: string,
  playerAnswer: number,
  playerTimeMs: number,
  opponentAnswer: number,
  opponentTimeMs: number,
  currentPlayerScore: number,
  currentOpponentScore: number
): RoundResult {
  const playerCorrect = playerAnswer === correctAnswer;
  const opponentCorrect = opponentAnswer === correctAnswer;

  let winner: "player" | "opponent" | "tie" = "tie";
  if (playerCorrect && !opponentCorrect) winner = "player";
  else if (!playerCorrect && opponentCorrect) winner = "opponent";
  // Both correct or both wrong = tie (no speed tiebreaker)

  // Score = correct answers (not round wins)
  const pScore = currentPlayerScore + (playerCorrect ? 1 : 0);
  const oScore = currentOpponentScore + (opponentCorrect ? 1 : 0);

  return {
    round_number: roundNumber,
    correct_answer: correctAnswer,
    explanation,
    player_answer: playerAnswer,
    player_time_ms: playerTimeMs,
    opponent_answer: opponentAnswer,
    opponent_time_ms: opponentTimeMs,
    round_winner: winner,
    player_score: pScore,
    opponent_score: oScore,
  };
}

export function useBattle({
  matchId,
  userId,
  opponentUsername,
  opponentRating,
  isBotMatch,
}: UseBattleProps) {
  const [phase, setPhase] = useState<BattlePhase>("loading");
  const [currentRound, setCurrentRound] = useState(1);
  const [question, setQuestion] = useState<BattleQuestion | null>(null);
  const [player, setPlayer] = useState<BattlePlayer | null>(null);
  const [opponent, setOpponent] = useState<BattlePlayer | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [opponentAnswered, setOpponentAnswered] = useState(false);
  const [roundWinner, setRoundWinner] = useState<string | null>(null);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [isPlayer1, setIsPlayer1] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const [opponentForfeited, setOpponentForfeited] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const forfeitDataRef = useRef<{ rating_change: number; new_rating: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const questionsRef = useRef<
    Array<{ round_number: number; round_id: string; question: BattleQuestion }>
  >([]);
  const isBotRef = useRef(false);
  const isRankedRef = useRef(true);
  const isPlayer1Ref = useRef(true);
  const playerScoreRef = useRef(0);
  const opponentScoreRef = useRef(0);
  const submittedRef = useRef(false);
  const opponentAnsweredRef = useRef(false);
  const roundProcessedRef = useRef<Set<number>>(new Set());
  const playerRef = useRef<BattlePlayer | null>(null);
  const opponentRef = useRef<BattlePlayer | null>(null);
  const currentRoundRef = useRef(1);
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextRoundRef = useRef<() => void>(() => {});
  const timedOutRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => { currentRoundRef.current = currentRound; }, [currentRound]);
  useEffect(() => { playerRef.current = player; }, [player]);
  useEffect(() => { opponentRef.current = opponent; }, [opponent]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clearPoll = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const clearAutoAdvance = useCallback(() => {
    if (autoAdvanceRef.current) {
      clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = null;
    }
  }, []);

  // Apply round result to state (shared by bot and human paths)
  const applyRoundResult = useCallback(
    async (result: RoundResult) => {
      playerScoreRef.current = result.player_score;
      opponentScoreRef.current = result.opponent_score;

      setRoundResult(result);
      setRoundResults((prev) => [...prev, result]);
      setRoundWinner(
        result.round_winner === "player"
          ? userId
          : result.round_winner === "opponent"
          ? "opponent"
          : null
      );
      setPlayer((prev) => (prev ? { ...prev, score: result.player_score } : prev));
      setOpponent((prev) => (prev ? { ...prev, score: result.opponent_score } : prev));

      clearTimer();
      clearPoll();
      setWaitingForOpponent(false);
      setPhase("result");

      // Schedule auto-advance
      clearAutoAdvance();
      const playerTimedOut = timedOutRef.current;

      // Check if match is over
      const pScore = result.player_score;
      const oScore = result.opponent_score;
      if (result.round_number >= 5) {
        const isComeback =
          (pScore === 3 && oScore === 2) || (oScore === 3 && pScore === 2);
        const matchWinner =
          pScore > oScore ? "player" : oScore > pScore ? "opponent" : "tie";

        const playerRating = playerRef.current?.rating ?? 0;
        const oppRating = opponentRef.current?.rating ?? 0;
        let ratingChange = 0;

        if (matchWinner === "player") {
          const { winnerDelta } = calculateRatingChange(
            playerRating,
            oppRating,
            isComeback
          );
          ratingChange = winnerDelta;
        } else if (matchWinner === "opponent") {
          const { loserDelta } = calculateRatingChange(
            oppRating,
            playerRating,
            false
          );
          ratingChange = loserDelta;
        }

        // Reduce bot match rating rewards to 60%
        if (isBotRef.current && ratingChange > 0) {
          ratingChange = Math.round(ratingChange * 0.6);
        }

        // Calculate XP earned (always awarded, even in practice)
        const matchResultType: "win" | "loss" | "draw" =
          matchWinner === "player" ? "win" : matchWinner === "tie" ? "draw" : "loss";
        const xpResult = calculateMatchXP(matchResultType);
        const newRating = isRankedRef.current
          ? applyFloorProtection(playerRating, playerRating + ratingChange)
          : playerRating;

        // Update profile and get XP result
        const xpUpdate = await updateProfileAfterMatch(
          userId,
          playerRating,
          ratingChange,
          matchResultType,
          isRankedRef.current,
          xpResult.totalXP
        );

        setMatchResult({
          winner: matchWinner,
          player_score: pScore,
          opponent_score: oScore,
          rating_change: isRankedRef.current ? ratingChange : 0,
          is_comeback: isComeback,
          is_forfeit: false,
          xp_earned: xpResult.totalXP,
          new_rating: newRating,
          new_level: xpUpdate.newLevel,
          leveled_up: xpUpdate.leveledUp,
          promoted_to: xpUpdate.promotedTo,
          old_streak: xpUpdate.oldStreak,
          new_streak: xpUpdate.newStreak,
        });

        // Only player1 updates the match record (to avoid double-writes)
        if (isPlayer1Ref.current) {
          // For bot wins, winner_id must be null (not "bot" — it's a UUID column)
          const opponentId = opponentRef.current?.id;
          const winnerId =
            matchWinner === "player"
              ? userId
              : matchWinner === "opponent"
              ? (opponentId && opponentId !== "bot" ? opponentId : null)
              : null;

          // Fire-and-forget: update match record then award league points
          (async () => {
            try {
              const { error: updateErr } = await supabase
                .from("matches")
                .update({
                  player1_score: isPlayer1Ref.current ? pScore : oScore,
                  player2_score: isPlayer1Ref.current ? oScore : pScore,
                  winner_id: winnerId,
                  player1_rating_change: isPlayer1Ref.current ? ratingChange : -ratingChange,
                  ended_at: new Date().toISOString(),
                })
                .eq("id", matchId);

              if (updateErr) {
                console.warn("[Battle] Match update error:", updateErr);
              }

              // Award league points (direct DB upsert)
              if (isRankedRef.current) {
                await awardLeaguePoints(userId, matchResultType);
              }
            } catch (err) {
              console.warn("[Battle] Match finalize error:", err);
            }
          })();
        }

        // Auto-advance to match_end after 2s
        autoAdvanceRef.current = setTimeout(() => {
          setPhase("match_end");
        }, 2000);
      } else {
        // Match continues — auto-advance to next round
        const delay = playerTimedOut ? 4000 : 3000;
        autoAdvanceRef.current = setTimeout(() => {
          nextRoundRef.current();
        }, delay);
      }
    },
    [userId, matchId, clearTimer, clearPoll, clearAutoAdvance]
  );

  // Process human round: fetch DB data, compute result
  const processHumanRound = useCallback(async () => {
    const round = currentRoundRef.current;

    // Double-processing guard
    if (roundProcessedRef.current.has(round)) return;
    roundProcessedRef.current.add(round);

    console.log(`[Battle] Processing human round ${round}`);

    try {
      const roundData = await fetchRoundResult(matchId, round);
      const q = roundData.questions as any;

      // Map player1/player2 to player/opponent based on role
      const playerAnswer = isPlayer1Ref.current
        ? roundData.player1_answer
        : roundData.player2_answer;
      const playerTimeMs = isPlayer1Ref.current
        ? roundData.player1_time_ms
        : roundData.player2_time_ms;
      const opponentAnswer = isPlayer1Ref.current
        ? roundData.player2_answer
        : roundData.player1_answer;
      const opponentTimeMs = isPlayer1Ref.current
        ? roundData.player2_time_ms
        : roundData.player1_time_ms;

      const result = computeRoundResult(
        round,
        q.correct_answer,
        q.explanation ?? "",
        playerAnswer ?? -1,
        playerTimeMs ?? 15000,
        opponentAnswer ?? -1,
        opponentTimeMs ?? 15000,
        playerScoreRef.current,
        opponentScoreRef.current
      );

      applyRoundResult(result);
    } catch (err) {
      console.error("[Battle] Failed to process human round:", err);
      // Remove from processed set so it can be retried
      roundProcessedRef.current.delete(round);
    }
  }, [matchId, applyRoundResult]);

  // Initialize battle
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const data = await startBattle(matchId, userId);
        if (!mounted) return;

        isBotRef.current = data.is_bot_match;
        isRankedRef.current = data.is_ranked;
        questionsRef.current = data.questions;

        const p1 = data.player1;
        const p2 = data.player2;
        const weArePlayer1 = p1?.id === userId;
        setIsPlayer1(weArePlayer1);
        isPlayer1Ref.current = weArePlayer1;

        if (weArePlayer1 && p1) {
          const playerData = {
            id: p1.id,
            username: p1.username,
            rating: p1.rating,
            score: 0,
          };
          const opponentData = {
            id: p2?.id ?? "bot",
            username: p2?.username ?? opponentUsername ?? "Opponent",
            rating: p2?.rating ?? opponentRating ?? 0,
            score: 0,
          };
          setPlayer(playerData);
          setOpponent(opponentData);
          playerRef.current = playerData;
          opponentRef.current = opponentData;
        } else if (p2 && p1) {
          const playerData = {
            id: p2.id,
            username: p2.username,
            rating: p2.rating,
            score: 0,
          };
          const opponentData = {
            id: p1.id,
            username: p1.username,
            rating: p1.rating,
            score: 0,
          };
          setPlayer(playerData);
          setOpponent(opponentData);
          playerRef.current = playerData;
          opponentRef.current = opponentData;
        }

        if (data.questions.length > 0) {
          setQuestion(data.questions[0].question);
        }

        setPhase("countdown");
        setCountdown(3);
      } catch (err) {
        console.error("Failed to start battle:", err);
      }
    };

    init();
    return () => { mounted = false; };
  }, [matchId, userId]);

  // Subscribe to broadcast (for human matches)
  useEffect(() => {
    if (isBotRef.current) return;

    const channel = createBattleChannel(matchId);
    channel
      .on("broadcast", { event: "player_answered" }, ({ payload }) => {
        if (payload.user_id !== userId) {
          console.log("[Battle] Opponent answered (broadcast)");
          setOpponentAnswered(true);
          opponentAnsweredRef.current = true;
          setWaitingForOpponent(false);
          // If we already submitted, process the round
          if (submittedRef.current) {
            processHumanRound();
          }
        }
      })
      .on("broadcast", { event: "opponent_forfeited" }, ({ payload }) => {
        if (payload.forfeited_by !== userId) {
          console.log("[Battle] Opponent forfeited");
          forfeitDataRef.current = {
            rating_change: payload.rating_change,
            new_rating: payload.new_rating,
          };
          clearTimer();
          clearPoll();
          setOpponentForfeited(true);
        }
      })
      .subscribe();

    channelRef.current = channel;
    return () => {
      clearTimer();
      clearPoll();
      channel.unsubscribe();
    };
  }, [matchId, userId, processHumanRound]);

  // Countdown timer
  useEffect(() => {
    if (phase !== "countdown") return;

    if (countdown <= 0) {
      setPhase("question");
      setTimeRemaining(15);
      startTimeRef.current = Date.now();
      submittedRef.current = false;
      opponentAnsweredRef.current = false;
      return;
    }

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, countdown]);

  // Question timer
  useEffect(() => {
    if (phase !== "question") return;

    clearTimer();
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearTimer();
          if (!submittedRef.current) {
            handleSubmitAnswer(-1);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [phase, currentRound]);

  // Process bot round result
  const processBotRound = useCallback(
    (playerAnswer: number, playerTimeMs: number) => {
      const q = questionsRef.current.find(
        (q) => q.round_number === currentRound
      );
      if (!q || q.question.correct_answer === undefined) return;

      const correctAnswer = q.question.correct_answer;
      const difficulty = 1; // TODO: get from question
      const botResult = generateBotAnswer(
        correctAnswer,
        q.question.options.length,
        difficulty
      );

      // Reveal result shortly after bot "thinks"
      setTimeout(() => {
        const result = computeRoundResult(
          currentRound,
          correctAnswer,
          q.question.explanation ?? "",
          playerAnswer,
          playerTimeMs,
          botResult.answer,
          botResult.timeMs,
          playerScoreRef.current,
          opponentScoreRef.current
        );

        applyRoundResult(result);
      }, 600);
    },
    [currentRound, applyRoundResult]
  );

  // Start fallback polling for human matches
  const startHumanPoll = useCallback(
    (round: number) => {
      clearPoll();
      const startedAt = Date.now();

      pollRef.current = setInterval(async () => {
        // Timeout after 25s
        if (Date.now() - startedAt > 25000) {
          console.log("[Battle] Poll timeout — processing round anyway");
          clearPoll();
          processHumanRound();
          return;
        }

        try {
          const bothDone = await checkBothAnswered(matchId, round);
          if (bothDone) {
            console.log("[Battle] Both answered (poll)");
            clearPoll();
            processHumanRound();
          }
        } catch (err) {
          console.warn("[Battle] Poll error:", err);
        }
      }, 2000);
    },
    [matchId, clearPoll, processHumanRound]
  );

  const handleSubmitAnswer = useCallback(
    async (answerIndex: number) => {
      if (submittedRef.current && answerIndex !== -1) return;
      if (phase !== "question" && answerIndex !== -1) return;

      submittedRef.current = true;
      const isTimeout = answerIndex === -1;
      setTimedOut(isTimeout);
      timedOutRef.current = isTimeout;
      const answerTime = Date.now() - startTimeRef.current;
      setSelectedAnswer(answerIndex);
      clearTimer();

      // Save to DB (includes broadcast for human matches)
      submitBattleAnswer(matchId, userId, currentRound, answerIndex, answerTime).catch(
        (err) => console.warn("[Battle] Submit error:", err)
      );

      if (isBotRef.current) {
        processBotRound(answerIndex, answerTime);
      } else {
        // Human match: show waiting state
        if (!opponentAnsweredRef.current) {
          setWaitingForOpponent(true);
        }

        // Start fallback polling
        startHumanPoll(currentRound);

        // If opponent already answered, process immediately
        if (opponentAnsweredRef.current) {
          processHumanRound();
        }
      }
    },
    [phase, matchId, userId, currentRound, processBotRound, startHumanPoll, processHumanRound]
  );

  const nextRound = useCallback(() => {
    if (matchResult) {
      setPhase("match_end");
      return;
    }

    if (currentRound >= 5) {
      setPhase("match_end");
      return;
    }

    const nextRoundNum = currentRound + 1;
    setCurrentRound(nextRoundNum);
    currentRoundRef.current = nextRoundNum;
    setSelectedAnswer(null);
    setOpponentAnswered(false);
    opponentAnsweredRef.current = false;
    setRoundWinner(null);
    setRoundResult(null);
    setTimedOut(false);
    timedOutRef.current = false;
    setWaitingForOpponent(false);
    submittedRef.current = false;

    const nextQ = questionsRef.current.find(
      (q) => q.round_number === nextRoundNum
    );
    if (nextQ) setQuestion(nextQ.question);

    setCountdown(3);
    setPhase("countdown");
  }, [matchResult, currentRound]);

  // Keep nextRoundRef in sync for auto-advance timer
  useEffect(() => { nextRoundRef.current = nextRound; }, [nextRound]);

  const handleForfeit = useCallback(async () => {
    clearTimer();
    clearPoll();
    clearAutoAdvance();

    try {
      const result = await forfeitMatch(matchId, userId);

      const playerRating = playerRef.current?.rating ?? 0;
      const oldTier = getTierForRating(playerRating);
      const newTier = getTierForRating(result.new_rating);
      const tierOrder = ["bronze", "silver", "gold", "diamond"] as const;
      const promoted = tierOrder.indexOf(newTier) > tierOrder.indexOf(oldTier);

      setMatchResult({
        winner: "opponent",
        player_score: playerScoreRef.current,
        opponent_score: opponentScoreRef.current,
        rating_change: result.rating_change,
        is_comeback: false,
        is_forfeit: true,
        xp_earned: result.xp_earned,
        new_rating: result.new_rating,
        new_level: result.new_level,
        leveled_up: result.leveled_up,
        promoted_to: promoted ? (newTier as "silver" | "gold" | "diamond") : null,
        old_streak: 0,
        new_streak: 0,
      });
      setPhase("match_end");
    } catch (err) {
      console.error("[Battle] Forfeit error:", err);
    }
  }, [matchId, userId, clearTimer, clearPoll, clearAutoAdvance]);

  const handleOpponentForfeitContinue = useCallback(async () => {
    const data = forfeitDataRef.current;
    const playerRating = playerRef.current?.rating ?? 0;
    const newRating = data?.new_rating ?? playerRating;
    const ratingChange = data?.rating_change ?? 0;

    const oldTier = getTierForRating(playerRating);
    const newTier = getTierForRating(newRating);
    const tierOrder = ["bronze", "silver", "gold", "diamond"] as const;
    const promoted = isRankedRef.current && tierOrder.indexOf(newTier) > tierOrder.indexOf(oldTier);

    const xpResult = calculateMatchXP("win");

    setMatchResult({
      winner: "player",
      player_score: playerScoreRef.current,
      opponent_score: opponentScoreRef.current,
      rating_change: isRankedRef.current ? ratingChange : 0,
      is_comeback: false,
      is_forfeit: true,
      xp_earned: xpResult.totalXP,
      new_rating: newRating,
      new_level: playerRef.current?.rating ? getLevelFromXP(0).level : 1, // approximate
      leveled_up: false,
      promoted_to: promoted ? (newTier as "silver" | "gold" | "diamond") : null,
      old_streak: 0,
      new_streak: 0,
    });
    setOpponentForfeited(false);
    setPhase("match_end");
  }, []);

  // Cleanup auto-advance on unmount
  useEffect(() => {
    return () => { clearAutoAdvance(); };
  }, [clearAutoAdvance]);

  return {
    phase,
    currentRound,
    totalRounds: 5,
    question,
    player,
    opponent,
    timeRemaining,
    selectedAnswer,
    opponentAnswered,
    roundWinner,
    roundResult,
    matchResult,
    roundResults,
    countdown,
    isPlayer1,
    timedOut,
    waitingForOpponent,
    submitAnswer: handleSubmitAnswer,
    handleForfeit,
    opponentForfeited,
    handleOpponentForfeitContinue,
  };
}

async function updateProfileAfterMatch(
  userId: string,
  currentRating: number,
  ratingChange: number,
  result: "win" | "loss" | "draw",
  isRanked: boolean,
  xpEarned: number
): Promise<{ newLevel: number; leveledUp: boolean; promotedTo: "silver" | "gold" | "diamond" | null; oldStreak: number; newStreak: number }> {
  const newRating = applyFloorProtection(
    currentRating,
    currentRating + ratingChange
  );
  const oldTier = getTierForRating(currentRating);
  const newTier = getTierForRating(newRating);
  const tierOrder = ["bronze", "silver", "gold", "diamond"] as const;
  const promoted = isRanked && tierOrder.indexOf(newTier) > tierOrder.indexOf(oldTier);
  const promotedTo = promoted ? (newTier as "silver" | "gold" | "diamond") : null;

  const { data: current, error: selectErr } = await supabase
    .from("profiles")
    .select("wins, losses, current_streak, best_streak, last_battle_date, streak_freezes, xp, level")
    .eq("id", userId)
    .single();

  if (selectErr) {
    console.error("[Battle] Failed to fetch profile for update:", selectErr);
  }

  const oldStreak = current?.current_streak ?? 0;
  const streakUpdate = calculateStreakUpdate({
    current_streak: oldStreak,
    best_streak: current?.best_streak ?? 0,
    last_battle_date: current?.last_battle_date ?? null,
    streak_freezes: current?.streak_freezes ?? 0,
  });

  // Calculate new XP and level
  const currentXP = current?.xp ?? 0;
  const currentLevel = current?.level ?? 1;
  const newTotalXP = currentXP + xpEarned;
  const levelInfo = getLevelFromXP(newTotalXP);
  const leveledUp = levelInfo.level > currentLevel;

  // Build update object - always update XP, conditionally update rating
  const updateData: Record<string, any> = {
    xp: newTotalXP,
    level: levelInfo.level,
    ...streakUpdate,
  };

  // Only update rating/wins/losses for ranked matches
  if (isRanked) {
    updateData.rating = newRating;
    updateData.tier = newTier;
    if (result === "win") updateData.wins = (current?.wins ?? 0) + 1;
    else if (result === "loss") updateData.losses = (current?.losses ?? 0) + 1;
    // draws: neither wins nor losses incremented
  }

  const { error: updateErr } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", userId);

  if (updateErr) {
    console.error("[Battle] Failed to update profile:", updateErr);
  }

  // League points are awarded via edge function call in applyRoundResult

  return { newLevel: levelInfo.level, leveledUp, promotedTo, oldStreak, newStreak: streakUpdate.current_streak };
}
