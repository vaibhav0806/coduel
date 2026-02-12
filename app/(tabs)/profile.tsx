import { View, Pressable, ScrollView, RefreshControl } from "react-native";
import { Text, TextBold, TextSemibold, TextMedium } from "@/components/ui/Text";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useState, useCallback, useEffect } from "react";
import ViewShot from "react-native-view-shot";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Match } from "@/types/database";
import { getTierConfig } from "@/lib/rating";
import { Skeleton, useSkeletonAnimation } from "@/components/ui/Skeleton";
import { ProfileShareCard } from "@/components/ProfileShareCard";
import { useShareCard } from "@/hooks/useShareCard";
import { useFollow } from "@/hooks/useFollow";

interface MatchHistoryItem {
  id: string;
  opponentName: string;
  opponentRating: number | null;
  opponentId: string | null;
  playerScore: number;
  opponentScore: number;
  ratingChange: number | null;
  result: "win" | "loss" | "draw";
  isBotMatch: boolean;
  date: string;
}

function MatchHistorySkeleton() {
  const shimmer = useSkeletonAnimation();

  return (
    <View>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          className={i < 2 ? "border-b border-dark-border" : ""}
        >
          <View className="flex-row items-center p-4">
            {/* W/L badge */}
            <Skeleton width={28} height={28} borderRadius={6} shimmerValue={shimmer} />
            {/* Name + score */}
            <View className="flex-1 ml-3">
              <Skeleton width={100 + i * 15} height={14} borderRadius={4} shimmerValue={shimmer} />
              <Skeleton width={70} height={11} borderRadius={4} shimmerValue={shimmer} style={{ marginTop: 6 }} />
            </View>
            {/* Rating change */}
            <Skeleton width={32} height={14} borderRadius={4} shimmerValue={shimmer} />
          </View>
        </View>
      ))}
    </View>
  );
}

function ProfileSkeleton() {
  const shimmer = useSkeletonAnimation();

  return (
    <SafeAreaView className="flex-1 bg-dark" edges={["top"]}>
      <LinearGradient
        colors={["#050508", "#080812", "#050508"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-3 pb-2">
        <Skeleton width={70} height={20} borderRadius={6} shimmerValue={shimmer} />
        <Skeleton width={20} height={20} borderRadius={10} shimmerValue={shimmer} />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Avatar + Name row */}
        <View className="flex-row items-center mx-6 mt-5">
          <Skeleton width={64} height={64} borderRadius={32} shimmerValue={shimmer} />
          <View className="ml-4 flex-1">
            <Skeleton width={140} height={20} borderRadius={6} shimmerValue={shimmer} />
            <View className="flex-row items-center mt-2">
              <Skeleton width={60} height={12} borderRadius={6} shimmerValue={shimmer} />
              <Skeleton width={50} height={16} borderRadius={10} shimmerValue={shimmer} style={{ marginLeft: 8 }} />
            </View>
          </View>
        </View>

        {/* Rating card */}
        <View className="mx-6 mt-5">
          <View className="bg-dark-card border border-dark-border rounded-xl p-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Skeleton width={120} height={36} borderRadius={6} shimmerValue={shimmer} />
                <Skeleton width={50} height={10} borderRadius={4} shimmerValue={shimmer} style={{ marginTop: 6 }} />
              </View>
              <Skeleton width={60} height={10} borderRadius={4} shimmerValue={shimmer} />
            </View>
            {/* Progress bar */}
            <View className="mt-3">
              <Skeleton width="100%" height={4} borderRadius={2} shimmerValue={shimmer} />
            </View>
          </View>
        </View>

        {/* Stats card */}
        <View className="mx-6 mt-5">
          <View className="bg-dark-card border border-dark-border rounded-xl p-4">
            <View className="flex-row">
              {[0, 1, 2, 3].map((i) => (
                <View key={i} className="flex-1 items-center" style={{ flexDirection: "column" }}>
                  {i > 0 && (
                    <View
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 1,
                        backgroundColor: "rgba(255,255,255,0.06)",
                      }}
                    />
                  )}
                  <Skeleton width={32} height={10} borderRadius={4} shimmerValue={shimmer} />
                  <Skeleton width={28} height={18} borderRadius={4} shimmerValue={shimmer} style={{ marginTop: 6 }} />
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Match history header */}
        <View className="mx-6 mt-6">
          <View className="flex-row items-center justify-between mb-3">
            <Skeleton width={110} height={14} borderRadius={4} shimmerValue={shimmer} />
            <Skeleton width={50} height={12} borderRadius={4} shimmerValue={shimmer} />
          </View>

          {/* Match rows */}
          <View className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                className={i < 2 ? "border-b border-dark-border" : ""}
              >
                <View className="flex-row items-center p-4">
                  <Skeleton width={28} height={28} borderRadius={6} shimmerValue={shimmer} />
                  <View className="flex-1 ml-3">
                    <Skeleton width={100 + i * 15} height={14} borderRadius={4} shimmerValue={shimmer} />
                    <Skeleton width={70} height={11} borderRadius={4} shimmerValue={shimmer} style={{ marginTop: 6 }} />
                  </View>
                  <Skeleton width={32} height={14} borderRadius={4} shimmerValue={shimmer} />
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function ProfileScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const { viewShotRef, isSharing, share } = useShareCard();
  const { followerCount, followingCount, refetch: refetchFollow } = useFollow(user?.id);
  const [matchHistory, setMatchHistory] = useState<MatchHistoryItem[]>([]);
  const [globalRank, setGlobalRank] = useState<number | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const progressWidth = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      refreshProfile();
      refetchFollow();
      if (user) {
        fetchMatchHistory(user.id);
        fetchGlobalRank();
      }
    }, [user])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refreshProfile(),
      refetchFollow(),
      user ? fetchMatchHistory(user.id) : Promise.resolve(),
      fetchGlobalRank(),
    ]);
    setRefreshing(false);
  }, [user]);

  const fetchGlobalRank = async () => {
    if (!user) return;
    // Fetch current rating directly from DB to avoid stale profile data
    const { data: fresh } = await supabase
      .from("profiles")
      .select("rating")
      .eq("id", user.id)
      .single();
    if (!fresh) return;
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gt("rating", fresh.rating);
    setGlobalRank((count ?? 0) + 1);
  };

  const fetchMatchHistory = async (userId: string) => {
    setLoadingHistory(true);
    try {
      const { data: matches } = await supabase
        .from("matches")
        .select("*")
        .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
        .order("ended_at", { ascending: false })
        .limit(10);

      if (!matches || matches.length === 0) {
        setMatchHistory([]);
        return;
      }

      const opponentIds = matches
        .filter((m) => !m.is_bot_match)
        .map((m) => (m.player1_id === userId ? m.player2_id : m.player1_id))
        .filter(Boolean) as string[];

      let opponentMap: Record<string, { username: string; rating: number }> = {};
      if (opponentIds.length > 0) {
        const { data: opponents } = await supabase
          .from("profiles")
          .select("id, username, rating")
          .in("id", opponentIds);
        if (opponents) {
          opponentMap = Object.fromEntries(opponents.map((o) => [o.id, { username: o.username, rating: o.rating }]));
        }
      }

      const items: MatchHistoryItem[] = matches.map((m: Match) => {
        const isP1 = m.player1_id === userId;
        const opponentId = isP1 ? m.player2_id : m.player1_id;
        const playerScore = isP1 ? m.player1_score : m.player2_score;
        const opponentScore = isP1 ? m.player2_score : m.player1_score;
        const ratingChange = isP1 ? m.player1_rating_change : m.player2_rating_change;
        const matchResult: "win" | "loss" | "draw" = m.winner_id === userId ? "win"
          : playerScore === opponentScore ? "draw"
          : "loss";

        let opponentName = "Bot";
        let opponentRating: number | null = null;
        if (!m.is_bot_match && opponentId) {
          const opp = opponentMap[opponentId];
          opponentName = opp?.username ?? "Opponent";
          opponentRating = opp?.rating ?? null;
        }

        return {
          id: m.id,
          opponentName,
          opponentRating,
          opponentId: m.is_bot_match ? null : (opponentId ?? null),
          playerScore,
          opponentScore,
          ratingChange,
          result: matchResult,
          isBotMatch: m.is_bot_match,
          date: m.ended_at,
        };
      });

      setMatchHistory(items);
    } catch (err) {
      console.error("Failed to fetch match history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (!profile) {
    return <ProfileSkeleton />;
  }

  const wins = profile.wins ?? 0;
  const losses = profile.losses ?? 0;
  const totalMatches = wins + losses;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
  const streak = profile.current_streak ?? 0;
  const bestStreak = profile.best_streak ?? 0;
  const rating = profile.rating ?? 0;
  const level = profile.level ?? 1;
  const tierConfig = getTierConfig(rating);

  // Contextual motivation message
  const getMotivation = (): { text: string; color: string } | null => {
    const ratingToSilver = 1000 - rating;
    const ratingToGold = 1500 - rating;
    const ratingToDiamond = 2000 - rating;

    if (streak >= 3) {
      return { text: `${streak} win streak — keep it going!`, color: "#FF6B35" };
    }
    if (rating < 1000 && ratingToSilver <= 100) {
      return { text: `${ratingToSilver} rating to Silver!`, color: "#C0C0C0" };
    }
    if (rating >= 1000 && rating < 1500 && ratingToGold <= 150) {
      return { text: `${ratingToGold} rating to Gold!`, color: "#FFD700" };
    }
    if (rating >= 1500 && rating < 2000 && ratingToDiamond <= 200) {
      return { text: `${ratingToDiamond} rating to Diamond!`, color: "#B9F2FF" };
    }
    if (winRate >= 75 && totalMatches >= 5) {
      return { text: `${winRate}% win rate — dominant!`, color: "#10B981" };
    }
    if (bestStreak > 0 && streak === bestStreak && streak >= 2) {
      return { text: "New personal best streak!", color: "#FF6B35" };
    }
    return null;
  };

  const motivation = getMotivation();

  // Animate progress bar
  useEffect(() => {
    const targetProgress = tierConfig.progress * 100;
    progressWidth.value = withTiming(targetProgress, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [tierConfig.progress]);

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%` as any,
  }));

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

  return (
    <SafeAreaView className="flex-1 bg-dark" edges={["top"]}>
      {/* Background gradient */}
      <LinearGradient
        colors={["#050508", "#080812", "#050508"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Hidden ProfileShareCard for capture */}
      <ViewShot
        ref={viewShotRef}
        options={{ format: "png", quality: 1 }}
        style={{ position: "absolute", left: -9999 }}
      >
        <ProfileShareCard
          username={profile.username ?? "Player"}
          rating={rating}
          tier={profile.tier ?? "bronze"}
          wins={wins}
          winRate={winRate}
          currentStreak={streak}
        />
      </ViewShot>

      {/* Section 1: Custom Header */}
      <Animated.View
        entering={FadeIn.duration(300)}
        className="flex-row items-center justify-between px-6 pt-3 pb-2"
      >
        <TextBold className="text-white" style={{ fontSize: 20 }}>
          Profile
        </TextBold>
        <View className="flex-row items-center">
          <Pressable onPress={share} disabled={isSharing} hitSlop={12} className="mr-4">
            <Ionicons
              name={isSharing ? "hourglass-outline" : "share-outline"}
              size={20}
              color="#6B7280"
            />
          </Pressable>
          <Pressable onPress={() => router.push("/modal")} hitSlop={12}>
            <Ionicons name="settings-outline" size={20} color="#6B7280" />
          </Pressable>
        </View>
      </Animated.View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#39FF14"
            colors={["#39FF14"]}
          />
        }
      >
        {/* Section 2: Compact Header — Avatar + Name + Rank */}
        <Animated.View
          entering={FadeIn.delay(100).duration(400)}
          className="flex-row items-center mx-6 mt-5"
        >
          {/* Avatar with Tier Ring */}
          <LinearGradient
            colors={tierConfig.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              padding: 2.5,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                width: 57,
                height: 57,
                borderRadius: 28.5,
                backgroundColor: "#0A0A0F",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TextBold style={{ fontSize: 24, color: tierConfig.colors[0] }}>
                {(profile.username?.[0] ?? "?").toUpperCase()}
              </TextBold>
            </View>
          </LinearGradient>

          {/* Name + Rank + Tier */}
          <View className="ml-4 flex-1">
            <TextBold className="text-white" style={{ fontSize: 20 }}>
              @{profile.username}
            </TextBold>
            <View className="flex-row items-center mt-1">
              {globalRank && (
                <View className="flex-row items-center mr-3">
                  <Text className="text-gray-500" style={{ fontSize: 12 }}>
                    Rank{" "}
                  </Text>
                  <TextSemibold className="text-white" style={{ fontSize: 12 }}>
                    #{globalRank}
                  </TextSemibold>
                </View>
              )}
              <LinearGradient
                colors={tierConfig.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 }}
              >
                <TextBold style={{ fontSize: 9, color: "#050508", letterSpacing: 0.5 }}>
                  {tierConfig.label.toUpperCase()}
                </TextBold>
              </LinearGradient>
            </View>
            <View className="flex-row items-center mt-1.5" style={{ gap: 12 }}>
              <View className="flex-row items-center">
                <TextSemibold className="text-white" style={{ fontSize: 12 }}>
                  {followerCount}
                </TextSemibold>
                <Text className="text-gray-500 ml-1" style={{ fontSize: 11 }}>
                  {followerCount === 1 ? "Follower" : "Followers"}
                </Text>
              </View>
              <View className="flex-row items-center">
                <TextSemibold className="text-white" style={{ fontSize: 12 }}>
                  {followingCount}
                </TextSemibold>
                <Text className="text-gray-500 ml-1" style={{ fontSize: 11 }}>
                  Following
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Section 3: Rating + Progress (compact) */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          className="mx-6 mt-5"
        >
          <View className="bg-dark-card border border-dark-border rounded-xl p-4">
            <View className="flex-row items-center justify-between">
              <View>
                <TextBold
                  style={{ fontSize: 36, color: "#FFFFFF", lineHeight: 42 }}
                >
                  {rating.toLocaleString()}
                </TextBold>
                <Text className="text-gray-500" style={{ fontSize: 10, marginTop: 2 }}>
                  Level {level}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-gray-500" style={{ fontSize: 10, letterSpacing: 0.5 }}>
                  {tierConfig.floor} — {tierConfig.ceiling === tierConfig.floor ? "MAX" : tierConfig.ceiling}
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View className="mt-3">
              <View
                style={{
                  height: 4,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <Animated.View style={progressAnimatedStyle}>
                  <LinearGradient
                    colors={tierConfig.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ height: 4, borderRadius: 2 }}
                  />
                </Animated.View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Motivation Message */}
        {motivation && (
          <Animated.View
            entering={FadeIn.delay(250).duration(300)}
            className="items-center mt-4"
          >
            <TextSemibold style={{ fontSize: 13, color: motivation.color }}>
              {motivation.text}
            </TextSemibold>
          </Animated.View>
        )}

        {/* Section 5: Compact Stats Card */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(300)}
          className="mx-6 mt-5"
        >
          <View className="bg-dark-card border border-dark-border rounded-xl p-4">
            <View className="flex-row">
              {/* Wins */}
              <View className="flex-1 items-center">
                <Text
                  className="text-gray-500"
                  style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase" }}
                >
                  WINS
                </Text>
                <TextBold style={{ fontSize: 18, color: "#10B981", marginTop: 4 }}>
                  {wins}
                </TextBold>
              </View>

              <View style={{ width: 1, backgroundColor: "rgba(255,255,255,0.06)" }} />

              {/* Losses */}
              <View className="flex-1 items-center">
                <Text
                  className="text-gray-500"
                  style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase" }}
                >
                  LOSSES
                </Text>
                <TextBold style={{ fontSize: 18, color: "#EF4444", marginTop: 4 }}>
                  {losses}
                </TextBold>
              </View>

              <View style={{ width: 1, backgroundColor: "rgba(255,255,255,0.06)" }} />

              {/* Win Rate */}
              <View className="flex-1 items-center">
                <Text
                  className="text-gray-500"
                  style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase" }}
                >
                  WIN RATE
                </Text>
                <TextBold
                  style={{
                    fontSize: 18,
                    color: winRate >= 50 ? "#10B981" : "#EF4444",
                    marginTop: 4,
                  }}
                >
                  {winRate}%
                </TextBold>
              </View>

              <View style={{ width: 1, backgroundColor: "rgba(255,255,255,0.06)" }} />

              {/* Streak */}
              <View className="flex-1 items-center">
                <Text
                  className="text-gray-500"
                  style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase" }}
                >
                  STREAK
                </Text>
                <TextBold style={{ fontSize: 18, color: "#FF6B35", marginTop: 4 }}>
                  {streak}
                </TextBold>
              </View>
            </View>
          </View>

          {/* Best streak */}
          {bestStreak > 0 && (
            <View className="flex-row items-center justify-center mt-2">
              <Ionicons name="flame" size={12} color="#4B5563" />
              <Text className="text-gray-600 ml-1" style={{ fontSize: 11 }}>
                Best streak: {bestStreak}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Section 6: Match History */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(300)}
          className="mx-6 mt-6"
        >
          <View className="flex-row items-center justify-between mb-3">
            <TextSemibold className="text-white" style={{ fontSize: 14 }}>
              Recent Matches
            </TextSemibold>
            <Text className="text-gray-500" style={{ fontSize: 12 }}>
              {totalMatches} total
            </Text>
          </View>

          <View className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
            {loadingHistory ? (
              <MatchHistorySkeleton />
            ) : matchHistory.length === 0 ? (
              <View className="p-6 items-center">
                <Ionicons name="game-controller-outline" size={32} color="#1A1A24" />
                <Text className="text-gray-500 mt-2" style={{ fontSize: 13 }}>
                  No matches yet
                </Text>
                <Text className="text-gray-600 mt-1" style={{ fontSize: 11 }}>
                  Win your first battle!
                </Text>
              </View>
            ) : (
              matchHistory.map((match, index) => (
                <Pressable
                  key={match.id}
                  onPress={() =>
                    router.push({
                      pathname: "/match/[id]",
                      params: { id: match.id },
                    })
                  }
                  style={{ overflow: "hidden" }}
                  className={
                    index < matchHistory.length - 1 ? "border-b border-dark-border" : ""
                  }
                >
                  <View className="flex-row items-center p-4">
                    {/* W/L/D Badge */}
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        backgroundColor: match.result === "win"
                          ? "rgba(16,185,129,0.15)"
                          : match.result === "draw"
                          ? "rgba(156,163,175,0.15)"
                          : "rgba(239,68,68,0.15)",
                        borderWidth: 1,
                        borderColor: match.result === "win"
                          ? "rgba(16,185,129,0.3)"
                          : match.result === "draw"
                          ? "rgba(156,163,175,0.3)"
                          : "rgba(239,68,68,0.3)",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <TextBold
                        style={{
                          fontSize: 12,
                          color: match.result === "win" ? "#10B981" : match.result === "draw" ? "#9CA3AF" : "#EF4444",
                        }}
                      >
                        {match.result === "win" ? "W" : match.result === "draw" ? "D" : "L"}
                      </TextBold>
                    </View>

                    {/* Opponent info */}
                    <View className="flex-1 ml-3">
                      <View className="flex-row items-center">
                        <TextMedium className="text-white" style={{ fontSize: 14 }}>
                          vs {match.opponentName}
                        </TextMedium>
                        {match.isBotMatch && (
                          <Ionicons
                            name="hardware-chip-outline"
                            size={12}
                            color="#4B5563"
                            style={{ marginLeft: 4 }}
                          />
                        )}
                        {match.opponentRating != null && (
                          <Text className="text-gray-500" style={{ fontSize: 12, marginLeft: 6 }}>
                            {match.opponentRating}
                          </Text>
                        )}
                        {match.opponentId && (
                          <Pressable
                            onPress={(e) => {
                              e.stopPropagation();
                              router.push({ pathname: "/user/[id]", params: { id: match.opponentId! } });
                            }}
                            hitSlop={8}
                            style={{ marginLeft: 6 }}
                          >
                            <Ionicons name="person-circle-outline" size={16} color="#39FF14" />
                          </Pressable>
                        )}
                      </View>
                      <Text className="text-gray-500" style={{ fontSize: 11, marginTop: 2 }}>
                        {match.playerScore}-{match.opponentScore} · {formatDate(match.date)}
                      </Text>
                    </View>

                    {/* Rating change */}
                    {match.ratingChange != null && (
                      <TextSemibold
                        style={{
                          fontSize: 14,
                          color: match.ratingChange >= 0 ? "#10B981" : "#EF4444",
                          marginRight: 8,
                        }}
                      >
                        {match.ratingChange >= 0 ? "+" : ""}
                        {match.ratingChange}
                      </TextSemibold>
                    )}

                    {/* Chevron */}
                    <Ionicons name="chevron-forward" size={16} color="#4B5563" />
                  </View>
                </Pressable>
              ))
            )}
          </View>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}
