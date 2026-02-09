import { View, FlatList, Pressable, RefreshControl } from "react-native";
import { Text, TextBold, TextSemibold, TextMedium } from "@/components/ui/Text";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useCallback } from "react";
import { useFocusEffect, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, FadeInDown, ZoomIn } from "react-native-reanimated";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { getWeekStart } from "@/lib/league";
import { getTierConfig } from "@/lib/rating";
import { Skeleton, useSkeletonAnimation } from "@/components/ui/Skeleton";

interface LeaderboardEntry {
  id: string;
  username: string;
  rating: number;
  tier: string;
  rank: number;
}

type TabType = "global" | "weekly";

const RANK_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];

const PLACEHOLDER_NAMES = [
  "swift_coder", "algo_ace", "dev_ninja", "byte_master", "code_fury",
  "logic_lord", "syntax_king", "null_ptr", "stack_hero", "bit_wizard",
  "loop_queen", "hash_hound", "lambda_pro", "regex_rex", "cache_boss",
];

function seedPlaceholders(
  realEntries: LeaderboardEntry[],
  minCount: number,
  mode: "global" | "weekly"
): LeaderboardEntry[] {
  if (realEntries.length >= minCount) return realEntries;

  const seeded = [...realEntries];
  const usedNames = new Set(realEntries.map((e) => e.username.toLowerCase()));
  let nameIdx = 0;

  const lowestRating = realEntries.length > 0
    ? realEntries[realEntries.length - 1].rating
    : mode === "global" ? 200 : 30;

  while (seeded.length < minCount) {
    // Find an unused name
    while (nameIdx < PLACEHOLDER_NAMES.length && usedNames.has(PLACEHOLDER_NAMES[nameIdx])) {
      nameIdx++;
    }
    if (nameIdx >= PLACEHOLDER_NAMES.length) break;

    const name = PLACEHOLDER_NAMES[nameIdx];
    usedNames.add(name);
    nameIdx++;

    const rank = seeded.length + 1;
    const ratingDrop = Math.floor(Math.random() * 20) + 5;
    const placeholderRating = Math.max(0, lowestRating - ratingDrop * (rank - realEntries.length));

    seeded.push({
      id: `placeholder-${rank}`,
      username: name,
      rating: placeholderRating,
      tier: "bronze",
      rank,
    });
  }

  return seeded;
}

function LeaderboardSkeleton() {
  const shimmer = useSkeletonAnimation();

  return (
    <View className="flex-1">
      {/* Subtitle bar */}
      <View className="px-6 mb-3">
        <Skeleton width={100} height={12} borderRadius={6} shimmerValue={shimmer} />
      </View>

      {/* Podium */}
      <View className="flex-row justify-center items-end px-6 pt-4 pb-2">
        {/* 2nd place */}
        <View className="flex-1 items-center" style={{ minHeight: 100 }}>
          <Skeleton width={48} height={48} borderRadius={24} shimmerValue={shimmer} />
          <Skeleton width={56} height={10} borderRadius={5} shimmerValue={shimmer} style={{ marginTop: 8 }} />
          <Skeleton width={36} height={14} borderRadius={4} shimmerValue={shimmer} style={{ marginTop: 4 }} />
        </View>
        {/* 1st place */}
        <View className="flex-1 items-center" style={{ minHeight: 130 }}>
          <Skeleton width={56} height={56} borderRadius={28} shimmerValue={shimmer} />
          <Skeleton width={60} height={10} borderRadius={5} shimmerValue={shimmer} style={{ marginTop: 8 }} />
          <Skeleton width={40} height={14} borderRadius={4} shimmerValue={shimmer} style={{ marginTop: 4 }} />
        </View>
        {/* 3rd place */}
        <View className="flex-1 items-center" style={{ minHeight: 85 }}>
          <Skeleton width={44} height={44} borderRadius={22} shimmerValue={shimmer} />
          <Skeleton width={52} height={10} borderRadius={5} shimmerValue={shimmer} style={{ marginTop: 8 }} />
          <Skeleton width={32} height={14} borderRadius={4} shimmerValue={shimmer} style={{ marginTop: 4 }} />
        </View>
      </View>

      {/* Divider */}
      <View
        style={{
          height: 1,
          backgroundColor: "rgba(255,255,255,0.08)",
          marginHorizontal: 24,
          marginTop: 8,
          marginBottom: 12,
        }}
      />

      {/* List rows */}
      {[0, 1, 2, 3, 4].map((i) => (
        <View
          key={i}
          className="mx-6 mb-2"
        >
          <View className="flex-row items-center py-3 px-4 bg-dark-card border border-dark-border rounded-xl">
            {/* Rank */}
            <Skeleton width={20} height={14} borderRadius={4} shimmerValue={shimmer} />
            {/* Tier dot */}
            <Skeleton
              width={8}
              height={8}
              borderRadius={4}
              shimmerValue={shimmer}
              style={{ marginLeft: 12, marginRight: 10 }}
            />
            {/* Name + tier */}
            <View className="flex-1">
              <Skeleton width={80 + i * 10} height={14} borderRadius={4} shimmerValue={shimmer} />
              <Skeleton width={40} height={10} borderRadius={4} shimmerValue={shimmer} style={{ marginTop: 4 }} />
            </View>
            {/* Rating */}
            <View className="items-end">
              <Skeleton width={36} height={16} borderRadius={4} shimmerValue={shimmer} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

export default function LeaderboardScreen() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("global");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUserEntry, setCurrentUserEntry] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchLeaderboard();
    }, [activeTab, user])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLeaderboard();
    setRefreshing(false);
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      if (activeTab === "global") {
        await fetchGlobalLeaderboard();
      } else {
        await fetchWeeklyLeaderboard();
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalLeaderboard = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, username, rating, tier")
      .order("rating", { ascending: false })
      .limit(50);

    if (!data) {
      setLeaderboard([]);
      return;
    }

    const rawEntries: LeaderboardEntry[] = data.map((p, i) => ({
      id: p.id,
      username: p.username,
      rating: p.rating,
      tier: p.tier,
      rank: i + 1,
    }));

    const entries = seedPlaceholders(rawEntries, 10, "global");
    setLeaderboard(entries);

    if (user) {
      const inList = entries.find((e) => e.id === user.id);
      if (inList) {
        setCurrentUserEntry(null);
      } else {
        const { count } = await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .gt("rating", profile?.rating ?? 0);

        setCurrentUserEntry({
          id: user.id,
          username: profile?.username ?? "You",
          rating: profile?.rating ?? 0,
          tier: profile?.tier ?? "bronze",
          rank: (count ?? 0) + 1,
        });
      }
    }
  };

  const fetchWeeklyLeaderboard = async () => {
    const weekStart = getWeekStart();

    // First, find the user's actual league_tier from their membership
    // (may differ from profile tier if rating changed mid-week)
    let leagueTier: string = profile?.tier ?? "bronze";
    if (user) {
      const { data: myMembership } = await supabase
        .from("league_memberships")
        .select("league_tier")
        .eq("user_id", user.id)
        .eq("week_start", weekStart)
        .single();
      if (myMembership) {
        leagueTier = myMembership.league_tier;
      }
    }

    const { data } = await supabase
      .from("league_memberships")
      .select("user_id, points, profiles(id, username, rating, tier)")
      .eq("week_start", weekStart)
      .eq("league_tier", leagueTier)
      .order("points", { ascending: false })
      .limit(50);

    if (!data || data.length === 0) {
      setLeaderboard([]);
      setCurrentUserEntry(null);
      return;
    }

    const rawEntries: LeaderboardEntry[] = data.map((m: any, i: number) => ({
      id: m.profiles?.id ?? m.user_id,
      username: m.profiles?.username ?? "Unknown",
      rating: m.points ?? 0,
      tier: m.profiles?.tier ?? leagueTier,
      rank: i + 1,
    }));

    const entries = seedPlaceholders(rawEntries, 10, "weekly");
    setLeaderboard(entries);

    if (user) {
      const inList = entries.find((e) => e.id === user.id);
      if (inList) {
        setCurrentUserEntry(null);
      } else {
        const { data: membership } = await supabase
          .from("league_memberships")
          .select("points")
          .eq("user_id", user.id)
          .eq("week_start", weekStart)
          .single();

        if (membership) {
          const { count } = await supabase
            .from("league_memberships")
            .select("id", { count: "exact", head: true })
            .eq("week_start", weekStart)
            .eq("league_tier", leagueTier)
            .gt("points", membership.points);

          setCurrentUserEntry({
            id: user.id,
            username: profile?.username ?? "You",
            rating: membership.points,
            tier: leagueTier,
            rank: (count ?? 0) + 1,
          });
        } else {
          setCurrentUserEntry(null);
        }
      }
    }
  };

  const getDaysLeft = () => {
    const now = new Date();
    const day = now.getDay();
    return day === 0 ? 1 : 8 - day;
  };

  const userTierConfig = getTierConfig(profile?.rating ?? 0);

  const renderPodium = () => {
    if (leaderboard.length < 3) return null;
    const order = [1, 0, 2]; // 2nd, 1st, 3rd
    const sizes = [48, 56, 44];
    const heights = [100, 130, 85];

    return (
      <Animated.View
        entering={FadeInDown.delay(200).duration(400)}
        className="flex-row justify-center items-end px-6 pt-4 pb-2"
      >
        {order.map((idx, col) => {
          const item = leaderboard[idx];
          const rankColor = RANK_COLORS[idx];
          const size = sizes[col];
          const height = heights[col];

          const isPlaceholder = item.id.startsWith("placeholder-");

          return (
            <Animated.View
              key={item.id}
              entering={ZoomIn.delay(250 + col * 100).duration(400)}
              className="flex-1 items-center"
              style={{ minHeight: height }}
            >
              <Pressable
                onPress={() => {
                  if (!isPlaceholder) {
                    router.push({ pathname: "/user/[id]", params: { id: item.id } });
                  }
                }}
                disabled={isPlaceholder}
                className="items-center"
              >
                {/* Avatar */}
                <View
                  style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: 2.5,
                    borderColor: rankColor,
                    backgroundColor: "#0A0A0F",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TextBold style={{ fontSize: size * 0.38, color: rankColor }}>
                    {(item.username?.[0] ?? "?").toUpperCase()}
                  </TextBold>
                  {/* Rank badge */}
                  <View
                    style={{
                      position: "absolute",
                      bottom: -4,
                      right: -4,
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      overflow: "hidden",
                    }}
                  >
                    <LinearGradient
                      colors={[rankColor, rankColor + "88"]}
                      style={{
                        width: 20,
                        height: 20,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <TextBold style={{ fontSize: 10, color: "#050508" }}>
                        {idx + 1}
                      </TextBold>
                    </LinearGradient>
                  </View>
                </View>

                {/* Name & Rating */}
                <Text
                  className="text-white mt-2"
                  style={{ fontSize: 12 }}
                  numberOfLines={1}
                >
                  {item.username}
                </Text>
                <TextBold className="text-white" style={{ fontSize: 14 }}>
                  {item.rating}
                </TextBold>
                <Text className="text-gray-500" style={{ fontSize: 9, letterSpacing: 0.5 }}>
                  {activeTab === "global" ? "RATING" : "PTS"}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </Animated.View>
    );
  };

  const renderContextBanner = () => {
    if (activeTab === "global") {
      return (
        <View className="px-6 mb-3">
          <Text className="text-gray-500" style={{ fontSize: 12 }}>
            Top 50 worldwide
          </Text>
        </View>
      );
    }

    return (
      <View className="mx-6 mb-3 bg-dark-card border border-dark-border rounded-xl overflow-hidden">
        <LinearGradient
          colors={userTierConfig.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: 2 }}
        />
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="flex-row items-center">
            <LinearGradient
              colors={userTierConfig.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 }}
            >
              <TextBold style={{ fontSize: 10, color: "#050508" }}>
                {userTierConfig.label}
              </TextBold>
            </LinearGradient>
            <TextSemibold className="text-white text-sm ml-2">League</TextSemibold>
          </View>
          <Text className="text-gray-500" style={{ fontSize: 12 }}>
            {getDaysLeft()} days left
          </Text>
        </View>
      </View>
    );
  };

  const renderListItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const isCurrentUser = item.id === user?.id;
    const itemTierConfig = getTierConfig(item.rating);
    const isPlaceholder = item.id.startsWith("placeholder-");

    return (
      <Pressable
        onPress={() => {
          if (!isPlaceholder) {
            router.push({ pathname: "/user/[id]", params: { id: item.id } });
          }
        }}
        disabled={isPlaceholder}
      >
      <Animated.View
        entering={FadeInDown.delay(Math.min(index, 15) * 30 + 100).duration(300)}
        className="mx-6 mb-2"
      >
        <View
          className={`flex-row items-center py-3 px-4 rounded-xl ${
            isCurrentUser
              ? "bg-primary/5 border border-primary/40"
              : "bg-dark-card border border-dark-border"
          }`}
          style={{ overflow: "hidden" }}
        >
          {/* Green accent bar for current user */}
          {isCurrentUser && (
            <View
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 3,
                borderTopLeftRadius: 12,
                borderBottomLeftRadius: 12,
                overflow: "hidden",
              }}
            >
              <LinearGradient
                colors={["#39FF14", "#32E012"]}
                style={{ flex: 1 }}
              />
            </View>
          )}

          {/* Rank */}
          <View style={{ width: 32 }}>
            <TextBold className="text-gray-500" style={{ fontSize: 14 }}>
              {item.rank}
            </TextBold>
          </View>

          {/* Tier dot */}
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: itemTierConfig.colors[0],
              marginRight: 10,
            }}
          />

          {/* Username & tier label */}
          <View className="flex-1">
            <TextSemibold
              className={isCurrentUser ? "text-primary-light" : "text-white"}
              style={{ fontSize: 14 }}
              numberOfLines={1}
            >
              {item.username}
            </TextSemibold>
            <TextMedium className="text-gray-500" style={{ fontSize: 11 }}>
              {itemTierConfig.label}
            </TextMedium>
          </View>

          {/* Rating */}
          <View className="items-end">
            <TextBold className="text-white" style={{ fontSize: 16 }}>
              {item.rating}
            </TextBold>
            <Text
              className="text-gray-500"
              style={{ fontSize: 9, letterSpacing: 0.5, textTransform: "uppercase" }}
            >
              {activeTab === "global" ? "rating" : "pts"}
            </Text>
          </View>
        </View>
      </Animated.View>
      </Pressable>
    );
  };

  const renderHeader = () => (
    <View>
      {renderContextBanner()}
      {renderPodium()}
      {leaderboard.length >= 3 && (
        <View
          style={{
            height: 1,
            backgroundColor: "rgba(255,255,255,0.08)",
            marginHorizontal: 24,
            marginTop: 8,
            marginBottom: 12,
          }}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-dark" edges={["top"]}>
      {/* Background gradient */}
      <LinearGradient
        colors={["#050508", "#080812", "#050508"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Section 1: Custom Header */}
      <Animated.View
        entering={FadeIn.duration(300)}
        className="flex-row items-center px-6 pt-3 pb-2"
      >
        <TextBold className="text-white" style={{ fontSize: 20 }}>
          Leaderboard
        </TextBold>
      </Animated.View>

      {/* Section 2: Tab Selector */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(300)}
        className="flex-row mx-6 mt-2 mb-4"
      >
        <Pressable
          onPress={() => setActiveTab("global")}
          className="flex-1 items-center pb-2"
        >
          <TextSemibold
            className={activeTab === "global" ? "text-white" : "text-gray-500"}
            style={{ fontSize: 14 }}
          >
            Global
          </TextSemibold>
          {activeTab === "global" && (
            <View style={{ marginTop: 6, width: "40%", height: 3, borderRadius: 1.5, overflow: "hidden" }}>
              <LinearGradient
                colors={["#39FF14", "#32E012"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1 }}
              />
            </View>
          )}
        </Pressable>

        {/* Subtle vertical divider */}
        <View style={{ width: 1, height: 20, backgroundColor: "rgba(255,255,255,0.08)", alignSelf: "center" }} />

        <Pressable
          onPress={() => setActiveTab("weekly")}
          className="flex-1 items-center pb-2"
        >
          <View className="flex-row items-center">
            <TextSemibold
              className={activeTab === "weekly" ? "text-white" : "text-gray-500"}
              style={{ fontSize: 14 }}
            >
              League
            </TextSemibold>
            {activeTab === "weekly" && (
              <View className="ml-2">
                <LinearGradient
                  colors={userTierConfig.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}
                >
                  <TextBold style={{ fontSize: 8, color: "#050508" }}>
                    {userTierConfig.label}
                  </TextBold>
                </LinearGradient>
              </View>
            )}
          </View>
          {activeTab === "weekly" && (
            <View style={{ marginTop: 6, width: "40%", height: 3, borderRadius: 1.5, overflow: "hidden" }}>
              <LinearGradient
                colors={["#39FF14", "#32E012"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1 }}
              />
            </View>
          )}
        </Pressable>
      </Animated.View>

      {/* Content */}
      {loading ? (
        <LeaderboardSkeleton />
      ) : leaderboard.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          {activeTab === "weekly" ? (
            <>
              {/* League context */}
              <View className="mb-6">
                <LinearGradient
                  colors={userTierConfig.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8 }}
                >
                  <TextBold style={{ fontSize: 12, color: "#050508", letterSpacing: 1 }}>
                    {userTierConfig.label.toUpperCase()} LEAGUE
                  </TextBold>
                </LinearGradient>
              </View>
              <Ionicons name="trophy-outline" size={48} color="#1A1A24" />
              <TextSemibold className="text-white mt-4" style={{ fontSize: 16 }}>
                Join this week's league
              </TextSemibold>
              <Text className="text-gray-500 mt-2 text-center" style={{ fontSize: 13 }}>
                Play a ranked match to start competing in the {userTierConfig.label} league
              </Text>
              <Pressable
                onPress={() => router.push("/(tabs)/")}
                className="mt-5"
              >
                <LinearGradient
                  colors={["#39FF14", "#32E012"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    borderRadius: 12,
                    paddingHorizontal: 28,
                    paddingVertical: 12,
                  }}
                >
                  <TextBold style={{ fontSize: 14, color: "#050508", letterSpacing: 1 }}>
                    PLAY NOW
                  </TextBold>
                </LinearGradient>
              </Pressable>
              <Text className="text-gray-600 mt-3" style={{ fontSize: 11 }}>
                +3 points per win · {getDaysLeft()} days left
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="trophy-outline" size={48} color="#1A1A24" />
              <Text className="text-gray-500 mt-3" style={{ fontSize: 14 }}>
                No players yet
              </Text>
            </>
          )}
        </View>
      ) : (
        <View className="flex-1">
          <FlatList
            data={leaderboard.length >= 3 ? leaderboard.slice(3) : leaderboard}
            renderItem={renderListItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={{
              paddingBottom: currentUserEntry ? 120 : 20,
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#39FF14"
                colors={["#39FF14"]}
              />
            }
          />

          {/* Sticky "Your Position" Footer */}
          {currentUserEntry && (
            <Animated.View
              entering={FadeInDown.delay(400).duration(300)}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
              }}
            >
              {/* Gradient fade */}
              <LinearGradient
                colors={["transparent", "#050508"]}
                style={{ height: 32 }}
              />
              <View style={{ backgroundColor: "#050508", paddingHorizontal: 24, paddingBottom: 16 }}>
                <Text
                  className="text-gray-500 mb-2"
                  style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase" }}
                >
                  YOUR RANK
                </Text>
                <View
                  className="bg-dark-card border border-primary/30 rounded-xl"
                  style={{ overflow: "hidden" }}
                >
                  {/* Green accent bar */}
                  <View
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 3,
                      borderTopLeftRadius: 12,
                      borderBottomLeftRadius: 12,
                      overflow: "hidden",
                    }}
                  >
                    <LinearGradient
                      colors={["#39FF14", "#32E012"]}
                      style={{ flex: 1 }}
                    />
                  </View>

                  <View className="flex-row items-center py-3 px-4">
                    {/* Rank */}
                    <View style={{ width: 32 }}>
                      <TextBold style={{ fontSize: 14, color: "#39FF14" }}>
                        {currentUserEntry.rank}
                      </TextBold>
                    </View>

                    {/* Tier dot */}
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: getTierConfig(
                          activeTab === "global" ? (profile?.rating ?? 0) : currentUserEntry.rating
                        ).colors[0],
                        marginRight: 10,
                      }}
                    />

                    {/* Username */}
                    <View className="flex-1">
                      <TextSemibold style={{ fontSize: 14, color: "#6FFF4A" }}>
                        {currentUserEntry.username}
                      </TextSemibold>
                      <TextMedium className="text-gray-500" style={{ fontSize: 11 }}>
                        {getTierConfig(profile?.rating ?? 0).label}
                      </TextMedium>
                    </View>

                    {/* Rating */}
                    <View className="items-end">
                      <TextBold className="text-white" style={{ fontSize: 16 }}>
                        {currentUserEntry.rating}
                      </TextBold>
                      <Text
                        className="text-gray-500"
                        style={{ fontSize: 9, letterSpacing: 0.5, textTransform: "uppercase" }}
                      >
                        {activeTab === "global" ? "rating" : "pts"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </Animated.View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
