import { View, Text as RNText, Pressable, ActivityIndicator } from "react-native";
import { Text, TextBold, TextSemibold, TextMedium } from "@/components/ui/Text";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  cancelAnimation,
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
} from "react-native-reanimated";
import ViewShot from "react-native-view-shot";
import { useEffect, useState } from "react";
import { useBattle } from "@/hooks/useBattle";
import { useAuth } from "@/contexts/AuthContext";
import { useShareCard } from "@/hooks/useShareCard";
import { ShareCard } from "@/components/ShareCard";
import { LinearGradient } from "expo-linear-gradient";
import { createBotMatch } from "@/lib/supabase";

export default function BattleScreen() {
  const { id, opponentUsername, opponentRating, isBotMatch } =
    useLocalSearchParams<{
      id: string;
      opponentUsername?: string;
      opponentRating?: string;
      isBotMatch?: string;
    }>();

  const { user, profile } = useAuth();
  const userId = user?.id ?? "";
  const { viewShotRef, isSharing, share } = useShareCard();

  const battle = useBattle({
    matchId: id,
    userId,
    opponentUsername: opponentUsername ?? undefined,
    opponentRating: opponentRating ? parseInt(opponentRating, 10) : undefined,
    isBotMatch: isBotMatch === "true",
  });

  const timerWidth = useSharedValue(100);

  const timerAnimatedStyle = useAnimatedStyle(() => ({
    width: `${timerWidth.value}%`,
  }));

  // Animate timer when question phase starts
  useEffect(() => {
    if (battle.phase === "question") {
      cancelAnimation(timerWidth);
      timerWidth.value = 100;
      timerWidth.value = withTiming(0, { duration: 20000 });
    } else {
      // Stop animation on any other phase (result, explanation, etc.)
      cancelAnimation(timerWidth);
      if (battle.phase === "countdown") {
        timerWidth.value = 100;
      }
    }
  }, [battle.phase, battle.currentRound]);

  // Cancel timer animation when answer is submitted
  useEffect(() => {
    if (battle.selectedAnswer !== null) {
      cancelAnimation(timerWidth);
    }
  }, [battle.selectedAnswer]);

  // Auto-show explanation after result
  useEffect(() => {
    if (battle.phase === "result") {
      const timer = setTimeout(() => battle.showExplanation(), 800);
      return () => clearTimeout(timer);
    }
  }, [battle.phase]);

  const handleExit = () => {
    router.back();
  };

  const handleBattle = async () => {
    if (!userId) return;
    try {
      // Create a new bot match (practice mode by default from post-match)
      const result = await createBotMatch(userId, false, null);
      router.replace({
        pathname: "/battle/[id]",
        params: {
          id: result.match_id,
          opponentUsername: result.opponent_username,
          opponentRating: result.opponent_rating.toString(),
          isBotMatch: "true",
        },
      });
    } catch (error) {
      console.error("Failed to create new battle:", error);
    }
  };

  // Loading Phase
  if (battle.phase === "loading") {
    return (
      <SafeAreaView className="flex-1 bg-dark items-center justify-center">
        <ActivityIndicator size="large" color="#39FF14" />
        <Text className="text-gray-400 text-lg mt-4">Loading battle...</Text>
      </SafeAreaView>
    );
  }

  // Countdown Phase
  if (battle.phase === "countdown") {
    return (
      <SafeAreaView className="flex-1 bg-dark items-center justify-center">
        <TextMedium className="text-gray-400 text-lg mb-4">
          Round {battle.currentRound}
        </TextMedium>
        <TextBold className="text-8xl text-primary">
          {battle.countdown}
        </TextBold>
        <TextMedium className="text-gray-400 text-lg mt-4">Get Ready!</TextMedium>
      </SafeAreaView>
    );
  }

  // Match End Phase
  if (battle.phase === "match_end") {
    const playerScore = battle.player?.score ?? 0;
    const opponentScore = battle.opponent?.score ?? 0;
    const isWinner = battle.matchResult
      ? battle.matchResult.winner === "player"
      : playerScore > opponentScore;

    const ratingChange = battle.matchResult?.rating_change ?? 0;
    const newRating = battle.matchResult?.new_rating ?? (profile?.rating ?? 0);
    const xpEarned = battle.matchResult?.xp_earned ?? 0;
    const newLevel = battle.matchResult?.new_level ?? (profile?.level ?? 1);
    const leveledUp = battle.matchResult?.leveled_up ?? false;
    const isComeback = battle.matchResult?.is_comeback ?? false;

    return (
      <SafeAreaView className="flex-1 bg-dark">
        {/* Hidden ShareCard for capture */}
        <ViewShot
          ref={viewShotRef}
          options={{ format: "png", quality: 1 }}
          style={{ position: "absolute", left: -9999 }}
        >
          <ShareCard
            isWinner={isWinner}
            playerUsername={profile?.username ?? battle.player?.username ?? "Player"}
            playerScore={playerScore}
            opponentScore={opponentScore}
            rating={newRating}
            ratingChange={ratingChange}
            tier={profile?.tier ?? "bronze"}
            currentStreak={profile?.current_streak ?? 0}
            isComeback={isComeback}
          />
        </ViewShot>

        {/* Header with Home and Share icons */}
        <Animated.View
          entering={FadeIn.delay(200).duration(300)}
          className="flex-row justify-between items-center px-6 pt-4"
        >
          <Pressable
            onPress={handleExit}
            className="w-11 h-11 bg-dark-card border border-dark-border rounded-full items-center justify-center"
          >
            <Ionicons name="home-outline" size={20} color="#9CA3AF" />
          </Pressable>
          <Pressable
            onPress={share}
            disabled={isSharing}
            className="w-11 h-11 bg-dark-card border border-dark-border rounded-full items-center justify-center"
          >
            <Ionicons
              name={isSharing ? "hourglass-outline" : "share-outline"}
              size={20}
              color="#9CA3AF"
            />
          </Pressable>
        </Animated.View>

        {/* Main Content */}
        <View className="flex-1 items-center justify-center px-6">
          {/* Victory/Defeat Text */}
          <Animated.Text
            entering={ZoomIn.delay(100).duration(400)}
            className={`text-5xl font-bold tracking-wider mb-6 ${
              isWinner ? "text-win" : "text-lose"
            }`}
          >
            {isWinner ? "VICTORY" : "DEFEAT"}
          </Animated.Text>

          {/* Main Result Card */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(400)}
            className="w-full bg-dark-card border border-dark-border rounded-3xl overflow-hidden"
          >
            {/* Score Section */}
            <View className="p-6 items-center border-b border-dark-border">
              <View className="flex-row items-center justify-center">
                <View className="items-center mr-8">
                  <Text className="text-gray-500 text-xs uppercase mb-1">You</Text>
                  <TextBold className={`text-5xl ${isWinner ? "text-win" : "text-white"}`}>
                    {playerScore}
                  </TextBold>
                </View>
                <View className="w-px h-16 bg-dark-border" />
                <View className="items-center ml-8">
                  <Text className="text-gray-500 text-xs uppercase mb-1">
                    {battle.opponent?.username ?? "Opponent"}
                  </Text>
                  <TextBold className={`text-5xl ${!isWinner ? "text-lose" : "text-white"}`}>
                    {opponentScore}
                  </TextBold>
                </View>
              </View>

              {isComeback && (
                <View className="bg-accent/20 px-3 py-1 rounded-full mt-4">
                  <TextBold className="text-accent text-xs uppercase tracking-wide">
                    Comeback Victory!
                  </TextBold>
                </View>
              )}
            </View>

            {/* Stats Section */}
            <View className="p-6">
              {/* Rating Change (only for ranked) */}
              {ratingChange !== 0 && (
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-gray-500">Rating</Text>
                  <View className="flex-row items-center">
                    <TextBold
                      className={`mr-2 ${
                        ratingChange > 0 ? "text-win" : "text-lose"
                      }`}
                    >
                      {ratingChange > 0 ? "+" : ""}{ratingChange}
                    </TextBold>
                    <TextBold className="text-white text-lg">{newRating}</TextBold>
                  </View>
                </View>
              )}

              {/* XP Earned */}
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-gray-500">XP Earned</Text>
                <View className="flex-row items-center">
                  <Ionicons name="star" size={16} color="#39FF14" />
                  <TextBold className="text-primary text-lg ml-1">+{xpEarned}</TextBold>
                </View>
              </View>

              {/* Level */}
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-500">Level</Text>
                <View className="flex-row items-center">
                  {leveledUp && (
                    <View className="bg-primary/20 px-2 py-0.5 rounded-full mr-2">
                      <TextBold className="text-primary text-xs">LEVEL UP!</TextBold>
                    </View>
                  )}
                  <TextBold className="text-white text-lg">{newLevel}</TextBold>
                </View>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Bottom Action Button */}
        <Animated.View
          entering={FadeInDown.delay(500).duration(400)}
          className="px-6 pb-6"
        >
          <Pressable
            onPress={handleBattle}
            className="overflow-hidden rounded-2xl"
          >
            <LinearGradient
              colors={["#39FF14", "#2DD10D"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-4 flex-row items-center justify-center"
            >
              <Ionicons name="flash" size={22} color="#FFFFFF" />
              <TextBold className="text-white text-lg ml-2">Play Again</TextBold>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // Question / Result / Explanation Phases
  const correctAnswer = battle.roundResult?.correct_answer ?? null;
  const showResult =
    battle.phase === "result" || battle.phase === "explanation";

  return (
    <SafeAreaView className="flex-1 bg-dark">
      {/* Header - Scores */}
      <View className="flex-row justify-between items-center px-6 py-4">
        <View className="items-center">
          <TextBold className="text-white">
            {battle.player?.username ?? "You"}
          </TextBold>
          <View className="flex-row mt-1">
            {[...Array(battle.totalRounds)].map((_, i) => (
              <View
                key={i}
                className={`w-3 h-3 rounded-full mx-1 ${
                  i < (battle.player?.score ?? 0)
                    ? "bg-win"
                    : "bg-dark-border"
                }`}
              />
            ))}
          </View>
        </View>

        <View className="items-center">
          <Text className="text-gray-400">
            Round {battle.currentRound}/{battle.totalRounds}
          </Text>
          <Text className="text-white font-bold text-lg">VS</Text>
        </View>

        <View className="items-center">
          <Text className="text-white font-bold">
            {battle.opponent?.username ?? "Opponent"}
          </Text>
          <View className="flex-row mt-1">
            {[...Array(battle.totalRounds)].map((_, i) => (
              <View
                key={i}
                className={`w-3 h-3 rounded-full mx-1 ${
                  i < (battle.opponent?.score ?? 0)
                    ? "bg-lose"
                    : "bg-dark-border"
                }`}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Timer Bar */}
      <View className="mx-6 h-2 bg-dark-card rounded-full overflow-hidden">
        <Animated.View
          style={timerAnimatedStyle}
          className="h-full bg-primary rounded-full"
        />
      </View>

      {/* Time Display */}
      <View className="items-center mt-2">
        <Text
          className={`font-bold ${
            battle.timeRemaining <= 5 ? "text-lose" : "text-gray-400"
          }`}
        >
          {battle.timeRemaining}s
        </Text>
      </View>

      {/* Question */}
      <View className="flex-1 px-6 pt-6">
        {/* Code Snippet */}
        {battle.question && (
          <>
            <View className="bg-dark-card rounded-xl p-4 border border-dark-border mb-6">
              <Text className="text-gray-400 text-xs mb-2 font-mono">
                {battle.question.language ?? "Python"}
              </Text>
              <Text className="text-white font-mono text-base leading-6">
                {battle.question.code_snippet}
              </Text>
            </View>

            {/* Question Text */}
            <Text className="text-white text-xl font-semibold mb-4">
              {battle.question.question_text}
            </Text>

            {/* Options */}
            <View className="space-y-3">
              {battle.question.options.map((option, index) => {
                const isSelected = battle.selectedAnswer === index;
                const isCorrect =
                  correctAnswer !== null && index === correctAnswer;
                const isWrongSelected =
                  showResult && isSelected && !isCorrect;

                let bgClass = "bg-dark-card border-dark-border";
                if (showResult) {
                  if (isCorrect) {
                    bgClass = "bg-win/20 border-win";
                  } else if (isWrongSelected) {
                    bgClass = "bg-lose/20 border-lose";
                  }
                } else if (isSelected) {
                  bgClass = "bg-primary/20 border-primary";
                }

                return (
                  <Pressable
                    key={index}
                    onPress={() => battle.submitAnswer(index)}
                    disabled={battle.selectedAnswer !== null || showResult}
                    className={`p-4 rounded-xl border ${bgClass} mb-3`}
                  >
                    <View className="flex-row items-center">
                      <View
                        className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                          showResult && isCorrect
                            ? "bg-win"
                            : isWrongSelected
                            ? "bg-lose"
                            : "bg-dark-border"
                        }`}
                      >
                        <Text className="text-white font-bold">
                          {String.fromCharCode(65 + index)}
                        </Text>
                      </View>
                      <Text className="text-white flex-1 font-mono">
                        {option}
                      </Text>
                      {showResult && isCorrect && (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color="#10B981"
                        />
                      )}
                      {isWrongSelected && (
                        <Ionicons
                          name="close-circle"
                          size={24}
                          color="#EF4444"
                        />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {/* Opponent Status */}
        {battle.phase === "question" && battle.opponentAnswered && (
          <View className="items-center mt-4">
            <Text className="text-gray-400">
              {battle.opponent?.username ?? "Opponent"} answered!
            </Text>
          </View>
        )}

        {/* Explanation */}
        {battle.phase === "explanation" && battle.roundResult && (
          <View className="mt-4 bg-dark-card rounded-xl p-4 border border-secondary/30">
            <Text className="text-secondary font-bold mb-2">Explanation</Text>
            <Text className="text-gray-300 leading-5">
              {battle.roundResult.explanation}
            </Text>
            <Pressable
              onPress={battle.nextRound}
              className="bg-primary rounded-xl p-3 mt-4"
            >
              <Text className="text-white text-center font-bold">
                {(battle.player?.score ?? 0) >= 2 ||
                (battle.opponent?.score ?? 0) >= 2 ||
                battle.currentRound >= battle.totalRounds
                  ? "See Results"
                  : "Next Round"}
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Reactions Bar */}
      {battle.phase === "question" && (
        <View className="flex-row justify-center space-x-4 pb-4">
          {["👀", "🔥", "💀", "🧠"].map((emoji) => (
            <Pressable
              key={emoji}
              onPress={() => battle.sendReaction(emoji)}
              className="w-12 h-12 bg-dark-card rounded-full items-center justify-center border border-dark-border"
            >
              <Text className="text-2xl">{emoji}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}
