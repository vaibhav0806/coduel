import { View, Pressable, ScrollView } from "react-native";
import { Text, TextBold, TextSemibold, TextMedium } from "@/components/ui/Text";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Profile, Match } from "@/types/database";
import { getTierConfig } from "@/lib/rating";
import { useFollow } from "@/hooks/useFollow";
import { Skeleton, useSkeletonAnimation } from "@/components/ui/Skeleton";

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

function PublicProfileSkeleton() {
  const shimmer = useSkeletonAnimation();

  return (
    <SafeAreaView className="flex-1 bg-dark" edges={["top"]}>
      <LinearGradient
        colors={["#050508", "#080812", "#050508"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <Skeleton width={32} height={32} borderRadius={16} shimmerValue={shimmer} />
        <Skeleton width={70} height={18} borderRadius={6} shimmerValue={shimmer} style={{ marginLeft: 12 }} />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Avatar + Name */}
        <View className="items-center mt-6">
          <Skeleton width={80} height={80} borderRadius={40} shimmerValue={shimmer} />
          <Skeleton width={140} height={20} borderRadius={6} shimmerValue={shimmer} style={{ marginTop: 12 }} />
          <View className="flex-row mt-3" style={{ gap: 16 }}>
            <Skeleton width={70} height={14} borderRadius={4} shimmerValue={shimmer} />
            <Skeleton width={70} height={14} borderRadius={4} shimmerValue={shimmer} />
          </View>
          <Skeleton width={100} height={40} borderRadius={12} shimmerValue={shimmer} style={{ marginTop: 16 }} />
        </View>

        {/* Stats card */}
        <View className="mx-6 mt-6">
          <View className="bg-dark-card border border-dark-border rounded-xl p-4">
            <View className="flex-row">
              {[0, 1, 2, 3, 4].map((i) => (
                <View key={i} className="flex-1 items-center">
                  <Skeleton width={32} height={10} borderRadius={4} shimmerValue={shimmer} />
                  <Skeleton width={28} height={18} borderRadius={4} shimmerValue={shimmer} style={{ marginTop: 6 }} />
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Match history */}
        <View className="mx-6 mt-6">
          <Skeleton width={110} height={14} borderRadius={4} shimmerValue={shimmer} />
          <View className="bg-dark-card border border-dark-border rounded-xl overflow-hidden mt-3">
            {[0, 1, 2].map((i) => (
              <View key={i} className={i < 2 ? "border-b border-dark-border" : ""}>
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

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [matchHistory, setMatchHistory] = useState<MatchHistoryItem[]>([]);
  const [globalRank, setGlobalRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const { isFollowing, followerCount, followingCount, toggleFollow, loading: followLoading } = useFollow(id);

  // Self-redirect
  useEffect(() => {
    if (id && user?.id && id === user.id) {
      router.replace("/(tabs)/profile");
    }
  }, [id, user?.id]);

  useEffect(() => {
    if (id) {
      fetchProfile();
      fetchMatchHistory(id);
      fetchGlobalRank(id);
    }
  }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();
      setProfileData(data);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalRank = async (userId: string) => {
    const { data: fresh } = await supabase
      .from("profiles")
      .select("rating")
      .eq("id", userId)
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

  if (loading || !profileData) {
    return <PublicProfileSkeleton />;
  }

  const wins = profileData.wins ?? 0;
  const losses = profileData.losses ?? 0;
  const totalMatches = wins + losses;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
  const streak = profileData.current_streak ?? 0;
  const rating = profileData.rating ?? 0;
  const tierConfig = getTierConfig(rating);

  return (
    <SafeAreaView className="flex-1 bg-dark" edges={["top"]}>
      <LinearGradient
        colors={["#050508", "#080812", "#050508"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

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
          Profile
        </TextBold>
      </Animated.View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + Name + Follow */}
        <Animated.View
          entering={FadeIn.delay(100).duration(400)}
          className="items-center mt-6"
        >
          {/* Avatar with Tier Ring */}
          <LinearGradient
            colors={tierConfig.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              padding: 3,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: "#0A0A0F",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TextBold style={{ fontSize: 30, color: tierConfig.colors[0] }}>
                {(profileData.username?.[0] ?? "?").toUpperCase()}
              </TextBold>
            </View>
          </LinearGradient>

          {/* Username */}
          <TextBold className="text-white mt-3" style={{ fontSize: 20 }}>
            @{profileData.username}
          </TextBold>

          {/* Rank + Tier */}
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

          {/* Follower / Following counts */}
          <View className="flex-row items-center mt-3" style={{ gap: 16 }}>
            <View className="flex-row items-center">
              <TextSemibold className="text-white" style={{ fontSize: 14 }}>
                {followerCount}
              </TextSemibold>
              <Text className="text-gray-500 ml-1" style={{ fontSize: 13 }}>
                {followerCount === 1 ? "Follower" : "Followers"}
              </Text>
            </View>
            <View className="flex-row items-center">
              <TextSemibold className="text-white" style={{ fontSize: 14 }}>
                {followingCount}
              </TextSemibold>
              <Text className="text-gray-500 ml-1" style={{ fontSize: 13 }}>
                Following
              </Text>
            </View>
          </View>

          {/* Follow Button (hidden for self) */}
          {user?.id !== id && (
            <Pressable
              onPress={toggleFollow}
              disabled={followLoading}
              className="mt-4"
              style={{ opacity: followLoading ? 0.5 : 1 }}
            >
              {isFollowing ? (
                <View
                  style={{
                    borderWidth: 1.5,
                    borderColor: "#39FF14",
                    borderRadius: 12,
                    paddingHorizontal: 28,
                    paddingVertical: 10,
                  }}
                >
                  <TextSemibold style={{ fontSize: 14, color: "#39FF14" }}>
                    Following
                  </TextSemibold>
                </View>
              ) : (
                <LinearGradient
                  colors={["#39FF14", "#32E012"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    borderRadius: 12,
                    paddingHorizontal: 28,
                    paddingVertical: 10,
                  }}
                >
                  <TextSemibold style={{ fontSize: 14, color: "#050508" }}>
                    Follow
                  </TextSemibold>
                </LinearGradient>
              )}
            </Pressable>
          )}
        </Animated.View>

        {/* Stats Card */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(300)}
          className="mx-6 mt-6"
        >
          <View className="bg-dark-card border border-dark-border rounded-xl p-4">
            <View className="flex-row">
              {/* Rating */}
              <View className="flex-1 items-center">
                <Text className="text-gray-500" style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase" }}>
                  RATING
                </Text>
                <TextBold style={{ fontSize: 18, color: "#FFFFFF", marginTop: 4 }}>
                  {rating}
                </TextBold>
              </View>

              <View style={{ width: 1, backgroundColor: "rgba(255,255,255,0.06)" }} />

              {/* Wins */}
              <View className="flex-1 items-center">
                <Text className="text-gray-500" style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase" }}>
                  WINS
                </Text>
                <TextBold style={{ fontSize: 18, color: "#10B981", marginTop: 4 }}>
                  {wins}
                </TextBold>
              </View>

              <View style={{ width: 1, backgroundColor: "rgba(255,255,255,0.06)" }} />

              {/* Losses */}
              <View className="flex-1 items-center">
                <Text className="text-gray-500" style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase" }}>
                  LOSSES
                </Text>
                <TextBold style={{ fontSize: 18, color: "#EF4444", marginTop: 4 }}>
                  {losses}
                </TextBold>
              </View>

              <View style={{ width: 1, backgroundColor: "rgba(255,255,255,0.06)" }} />

              {/* Win Rate */}
              <View className="flex-1 items-center">
                <Text className="text-gray-500" style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase" }}>
                  WIN RATE
                </Text>
                <TextBold style={{ fontSize: 18, color: winRate >= 50 ? "#10B981" : "#EF4444", marginTop: 4 }}>
                  {winRate}%
                </TextBold>
              </View>

              <View style={{ width: 1, backgroundColor: "rgba(255,255,255,0.06)" }} />

              {/* Streak */}
              <View className="flex-1 items-center">
                <Text className="text-gray-500" style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase" }}>
                  STREAK
                </Text>
                <TextBold style={{ fontSize: 18, color: "#FF6B35", marginTop: 4 }}>
                  {streak}
                </TextBold>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Match History */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(300)}
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
              </View>
            ) : (
              matchHistory.map((match, index) => (
                <Pressable
                  key={match.id}
                  onPress={() =>
                    router.push({
                      pathname: "/match/[id]",
                      params: { id: match.id, viewAs: id },
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

function MatchHistorySkeleton() {
  const shimmer = useSkeletonAnimation();

  return (
    <View>
      {[0, 1, 2].map((i) => (
        <View key={i} className={i < 2 ? "border-b border-dark-border" : ""}>
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
  );
}
