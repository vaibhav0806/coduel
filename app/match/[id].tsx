import { View, ScrollView, Pressable } from "react-native";
import { Text, TextBold, TextSemibold, TextMedium } from "@/components/ui/Text";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Match, MatchRound, Question } from "@/types/database";
import { Skeleton, useSkeletonAnimation } from "@/components/ui/Skeleton";

interface MatchDetailRound {
  roundNumber: number;
  question: {
    language: string;
    code_snippet: string;
    question_text: string;
    options: string[];
    correct_answer: number;
    explanation: string;
  } | null;
  playerAnswer: number | null;
  playerTimeMs: number | null;
  opponentAnswer: number | null;
  opponentTimeMs: number | null;
  roundWinnerId: string | null;
}

interface MatchDetail {
  match: Match;
  rounds: MatchDetailRound[];
  opponentName: string;
  opponentRating: number | null;
  opponentId: string | null;
  playerScore: number;
  opponentScore: number;
  ratingChange: number | null;
  result: "win" | "loss" | "draw";
  isBotMatch: boolean;
  forfeitedBy: string | null;
}

function ReviewSkeleton() {
  const shimmer = useSkeletonAnimation();

  return (
    <SafeAreaView className="flex-1 bg-dark" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <Skeleton width={32} height={32} borderRadius={16} shimmerValue={shimmer} />
        <Skeleton width={120} height={18} borderRadius={6} shimmerValue={shimmer} style={{ marginLeft: 12 }} />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Summary card */}
        <View className="mx-4 mt-2">
          <View className="bg-dark-card border border-dark-border rounded-2xl p-6 items-center">
            <Skeleton width={140} height={32} borderRadius={8} shimmerValue={shimmer} />
            <Skeleton width={80} height={40} borderRadius={8} shimmerValue={shimmer} style={{ marginTop: 12 }} />
            <Skeleton width={120} height={14} borderRadius={4} shimmerValue={shimmer} style={{ marginTop: 12 }} />
            <Skeleton width={50} height={22} borderRadius={12} shimmerValue={shimmer} style={{ marginTop: 8 }} />
          </View>
        </View>

        {/* Round cards */}
        {[0, 1, 2].map((i) => (
          <View key={i} className="mx-4 mt-4">
            <View className="bg-dark-card border border-dark-border rounded-2xl p-4">
              <Skeleton width={100} height={14} borderRadius={4} shimmerValue={shimmer} />
              <Skeleton width="100%" height={80} borderRadius={8} shimmerValue={shimmer} style={{ marginTop: 12 }} />
              <Skeleton width="100%" height={16} borderRadius={4} shimmerValue={shimmer} style={{ marginTop: 12 }} />
              {[0, 1, 2, 3].map((j) => (
                <Skeleton key={j} width="100%" height={44} borderRadius={10} shimmerValue={shimmer} style={{ marginTop: 8 }} />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function MatchReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const [detail, setDetail] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && userId) fetchMatchDetail();
  }, [id, userId]);

  const fetchMatchDetail = async () => {
    setLoading(true);
    try {
      // Fetch match
      const { data: match } = await supabase
        .from("matches")
        .select("*")
        .eq("id", id)
        .single();

      if (!match) return;

      // Fetch rounds with questions
      const { data: rounds } = await supabase
        .from("match_rounds")
        .select("*, questions(*)")
        .eq("match_id", id)
        .order("round_number", { ascending: true });

      const isP1 = match.player1_id === userId;
      const opponentId = isP1 ? match.player2_id : match.player1_id;

      // Fetch opponent profile
      let opponentName = "Bot";
      let opponentRating: number | null = null;
      if (!match.is_bot_match && opponentId) {
        const { data: opponent } = await supabase
          .from("profiles")
          .select("id, username, rating")
          .eq("id", opponentId)
          .single();
        if (opponent) {
          opponentName = opponent.username;
          opponentRating = opponent.rating;
        }
      }

      const detailRounds: MatchDetailRound[] = (rounds ?? []).map((r: any) => {
        const question = r.questions;
        return {
          roundNumber: r.round_number,
          question: question
            ? {
                language: question.language,
                code_snippet: question.code_snippet,
                question_text: question.question_text,
                options: question.options,
                correct_answer: question.correct_answer,
                explanation: question.explanation,
              }
            : null,
          playerAnswer: isP1 ? r.player1_answer : r.player2_answer,
          playerTimeMs: isP1 ? r.player1_time_ms : r.player2_time_ms,
          opponentAnswer: isP1 ? r.player2_answer : r.player1_answer,
          opponentTimeMs: isP1 ? r.player2_time_ms : r.player1_time_ms,
          roundWinnerId: r.round_winner_id,
        };
      });

      setDetail({
        match,
        rounds: detailRounds,
        opponentName,
        opponentRating,
        opponentId: match.is_bot_match ? null : (opponentId ?? null),
        playerScore: isP1 ? match.player1_score : match.player2_score,
        opponentScore: isP1 ? match.player2_score : match.player1_score,
        ratingChange: isP1 ? match.player1_rating_change : match.player2_rating_change,
        result: match.winner_id === userId ? "win"
          : match.winner_id === null && match.ended_at && !match.forfeited_by ? "draw"
          : "loss",
        isBotMatch: match.is_bot_match,
        forfeitedBy: match.forfeited_by,
      });
    } catch (err) {
      console.error("Failed to fetch match detail:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (loading) return <ReviewSkeleton />;

  if (!detail) {
    return (
      <SafeAreaView className="flex-1 bg-dark items-center justify-center" edges={["top"]}>
        <Text className="text-gray-400 text-lg">Match not found</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <TextSemibold className="text-primary">Go back</TextSemibold>
        </Pressable>
      </SafeAreaView>
    );
  }

  const { match, rounds, opponentName, opponentRating, opponentId, playerScore, opponentScore, ratingChange, result, isBotMatch, forfeitedBy } = detail;
  const totalRounds = rounds.length;
  const won = result === "win";
  const isForfeit = !!forfeitedBy;
  const playerForfeited = forfeitedBy === userId;

  return (
    <SafeAreaView className="flex-1 bg-dark" edges={["top"]}>
      {/* Header */}
      <Animated.View
        entering={FadeIn.duration(300)}
        className="flex-row items-center px-4 py-3"
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          className="w-8 h-8 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>
        <TextBold className="text-white ml-3" style={{ fontSize: 18 }}>
          Match Review
        </TextBold>
      </Animated.View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Match Summary Card */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          className="mx-4 mt-2"
        >
          <View className="bg-dark-card border border-dark-border rounded-2xl p-6 items-center">
            {/* Result text */}
            <TextBold
              style={{
                fontSize: 28,
                color: result === "win" ? "#10B981" : result === "draw" ? "#9CA3AF" : "#EF4444",
                letterSpacing: 2,
              }}
            >
              {isForfeit
                ? result === "win"
                  ? "FORFEIT WIN"
                  : "FORFEITED"
                : result === "draw"
                ? "DRAW"
                : result === "win"
                ? "VICTORY"
                : "DEFEAT"}
            </TextBold>
            {isForfeit && (
              <Text className="text-gray-500 mt-1" style={{ fontSize: 12 }}>
                {playerForfeited ? "You forfeited" : "Opponent forfeited"}
              </Text>
            )}

            {/* Score */}
            <View className="flex-row items-center mt-3">
              <TextBold
                style={{
                  fontSize: 36,
                  color: result === "draw" ? "#FFFFFF" : won ? "#10B981" : "#FFFFFF",
                  lineHeight: 42,
                }}
              >
                {playerScore}
              </TextBold>
              <TextBold
                style={{
                  fontSize: 20,
                  color: "#4B5563",
                  marginHorizontal: 10,
                }}
              >
                —
              </TextBold>
              <TextBold
                style={{
                  fontSize: 36,
                  color: result === "draw" ? "#FFFFFF" : !won ? "#EF4444" : "#FFFFFF",
                  lineHeight: 42,
                }}
              >
                {opponentScore}
              </TextBold>
            </View>

            {/* Opponent */}
            <Pressable
              onPress={() => {
                if (opponentId) {
                  router.push({ pathname: "/user/[id]", params: { id: opponentId } });
                }
              }}
              disabled={!opponentId}
              className="flex-row items-center mt-3"
            >
              <Text
                style={{
                  fontSize: 14,
                  color: opponentId ? "#39FF14" : "#9CA3AF",
                }}
              >
                vs {opponentName}
              </Text>
              {isBotMatch && (
                <Ionicons
                  name="hardware-chip-outline"
                  size={12}
                  color="#4B5563"
                  style={{ marginLeft: 4 }}
                />
              )}
              {opponentRating != null && (
                <Text className="text-gray-500" style={{ fontSize: 13, marginLeft: 6 }}>
                  {opponentRating}
                </Text>
              )}
            </Pressable>

            {/* Rating change pill */}
            {ratingChange != null && ratingChange !== 0 && (
              <View
                style={{
                  marginTop: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 4,
                  borderRadius: 14,
                  backgroundColor:
                    ratingChange >= 0
                      ? "rgba(16,185,129,0.15)"
                      : "rgba(239,68,68,0.15)",
                }}
              >
                <TextBold
                  style={{
                    fontSize: 15,
                    color: ratingChange >= 0 ? "#10B981" : "#EF4444",
                  }}
                >
                  {ratingChange >= 0 ? "+" : ""}
                  {ratingChange}
                </TextBold>
              </View>
            )}

            {/* Date */}
            <Text className="text-gray-600 mt-2" style={{ fontSize: 12 }}>
              {formatDate(match.ended_at)}
            </Text>
          </View>
        </Animated.View>

        {/* Round Cards */}
        {rounds.map((round, index) => {
          const playerWonRound = round.roundWinnerId === userId;
          const playerCorrect =
            round.question != null &&
            round.playerAnswer === round.question.correct_answer;

          return (
            <Animated.View
              key={round.roundNumber}
              entering={FadeInDown.delay(200 + index * 100).duration(400)}
              className="mx-4 mt-4"
            >
              <View className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
                {/* Round header */}
                <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
                  <TextSemibold className="text-gray-400" style={{ fontSize: 13 }}>
                    Round {round.roundNumber} of {totalRounds}
                  </TextSemibold>
                  {round.question != null && (
                    <Ionicons
                      name={playerCorrect ? "checkmark-circle" : "close-circle"}
                      size={20}
                      color={playerCorrect ? "#10B981" : "#EF4444"}
                    />
                  )}
                </View>

                {round.question ? (
                  <View className="px-4 pb-4">
                    {/* Code snippet */}
                    <View className="bg-dark rounded-xl p-4 border border-dark-border mb-3">
                      <Text className="text-gray-400 text-xs mb-2 font-mono">
                        {round.question.language}
                      </Text>
                      <Text className="text-white font-mono text-base leading-6">
                        {round.question.code_snippet}
                      </Text>
                    </View>

                    {/* Question text */}
                    <TextSemibold className="text-white mb-3" style={{ fontSize: 15 }}>
                      {round.question.question_text}
                    </TextSemibold>

                    {/* Options */}
                    {round.question.options.map((option, optIdx) => {
                      const isCorrect = optIdx === round.question!.correct_answer;
                      const isPlayerAnswer = optIdx === round.playerAnswer;
                      const isWrongSelected = isPlayerAnswer && !isCorrect;

                      let bgClass = "bg-dark border-dark-border";
                      if (isCorrect) {
                        bgClass = "bg-win/20 border-win";
                      } else if (isWrongSelected) {
                        bgClass = "bg-lose/20 border-lose";
                      }

                      return (
                        <View
                          key={optIdx}
                          className={`p-3 rounded-xl border ${bgClass} mb-2`}
                        >
                          <View className="flex-row items-center">
                            <View
                              className={`w-7 h-7 rounded-full items-center justify-center mr-3 ${
                                isCorrect
                                  ? "bg-win"
                                  : isWrongSelected
                                  ? "bg-lose"
                                  : "bg-dark-border"
                              }`}
                            >
                              <Text className="text-white font-bold" style={{ fontSize: 12 }}>
                                {String.fromCharCode(65 + optIdx)}
                              </Text>
                            </View>
                            <Text className="text-white flex-1 font-mono" style={{ fontSize: 14 }}>
                              {option}
                            </Text>
                            {isCorrect && (
                              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                            )}
                            {isWrongSelected && (
                              <Ionicons name="close-circle" size={20} color="#EF4444" />
                            )}
                          </View>
                        </View>
                      );
                    })}

                    {/* Response times */}
                    <View className="flex-row items-center mt-2" style={{ gap: 16 }}>
                      {round.playerTimeMs != null && (
                        <View className="flex-row items-center">
                          <Text className="text-gray-500" style={{ fontSize: 11 }}>
                            You:{" "}
                          </Text>
                          <TextMedium className="text-gray-400" style={{ fontSize: 11 }}>
                            {(round.playerTimeMs / 1000).toFixed(1)}s
                          </TextMedium>
                        </View>
                      )}
                      {round.opponentTimeMs != null && (
                        <View className="flex-row items-center">
                          <Text className="text-gray-500" style={{ fontSize: 11 }}>
                            {opponentName}:{" "}
                          </Text>
                          <TextMedium className="text-gray-400" style={{ fontSize: 11 }}>
                            {(round.opponentTimeMs / 1000).toFixed(1)}s
                          </TextMedium>
                        </View>
                      )}
                    </View>

                    {/* Explanation */}
                    <View className="mt-3 bg-dark rounded-xl p-4 border border-secondary/30">
                      <TextSemibold className="text-secondary mb-1" style={{ fontSize: 13 }}>
                        Explanation
                      </TextSemibold>
                      <Text className="text-gray-300 leading-5" style={{ fontSize: 13 }}>
                        {round.question.explanation}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View className="px-4 pb-4 items-center py-6">
                    <Text className="text-gray-500" style={{ fontSize: 13 }}>
                      Question no longer available
                    </Text>
                  </View>
                )}
              </View>
            </Animated.View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
