import { View, Text, FlatList, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { getWeekStart } from "@/lib/league";

interface LeaderboardEntry {
  id: string;
  username: string;
  rating: number;
  tier: string;
  rank: number;
}

const tierEmojis: Record<string, string> = {
  bronze: "🥉",
  silver: "🥈",
  gold: "🥇",
  diamond: "💎",
};

type TabType = "global" | "weekly";

export default function LeaderboardScreen() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("global");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUserEntry, setCurrentUserEntry] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchLeaderboard();
    }, [activeTab, user])
  );

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

    const entries: LeaderboardEntry[] = data.map((p, i) => ({
      id: p.id,
      username: p.username,
      rating: p.rating,
      tier: p.tier,
      rank: i + 1,
    }));

    setLeaderboard(entries);

    // Check if current user is already in the top 50
    if (user) {
      const inList = entries.find((e) => e.id === user.id);
      if (inList) {
        setCurrentUserEntry(null); // Already visible in list
      } else {
        // Fetch their rank
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
    const userTier = profile?.tier ?? "bronze";

    const { data } = await supabase
      .from("league_memberships")
      .select("user_id, points, profiles(id, username, rating, tier)")
      .eq("week_start", weekStart)
      .eq("league_tier", userTier)
      .order("points", { ascending: false })
      .limit(50);

    if (!data || data.length === 0) {
      setLeaderboard([]);
      setCurrentUserEntry(null);
      return;
    }

    const entries: LeaderboardEntry[] = data.map((m: any, i: number) => ({
      id: m.profiles?.id ?? m.user_id,
      username: m.profiles?.username ?? "Unknown",
      rating: m.points ?? 0,
      tier: m.profiles?.tier ?? userTier,
      rank: i + 1,
    }));

    setLeaderboard(entries);

    if (user) {
      const inList = entries.find((e) => e.id === user.id);
      if (inList) {
        setCurrentUserEntry(null); // Already visible in list
      } else {
        // User not in top 50 — fetch their row and compute position
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
            .eq("league_tier", userTier)
            .gt("points", membership.points);

          setCurrentUserEntry({
            id: user.id,
            username: profile?.username ?? "You",
            rating: membership.points,
            tier: userTier,
            rank: (count ?? 0) + 1,
          });
        } else {
          setCurrentUserEntry(null); // Not in league this week
        }
      }
    }
  };

  const renderLeaderboardItem = ({
    item,
  }: {
    item: LeaderboardEntry;
  }) => {
    const isTopThree = item.rank <= 3;
    const isCurrentUser = item.id === user?.id;

    return (
      <View
        className={`flex-row items-center px-4 py-3 mx-4 mb-2 rounded-xl ${
          isCurrentUser
            ? "bg-primary/20 border border-primary"
            : "bg-dark-card border border-dark-border"
        }`}
      >
        {/* Rank */}
        <View className="w-10 items-center">
          {isTopThree ? (
            <Text className="text-2xl">
              {item.rank === 1 ? "🥇" : item.rank === 2 ? "🥈" : "🥉"}
            </Text>
          ) : (
            <Text className="text-gray-400 font-bold">#{item.rank}</Text>
          )}
        </View>

        {/* Username & Tier */}
        <View className="flex-1 ml-3">
          <View className="flex-row items-center">
            <Text
              className={`font-semibold ${
                isCurrentUser ? "text-primary-light" : "text-white"
              }`}
            >
              {item.username}
            </Text>
            {isCurrentUser && (
              <Text className="text-primary-light text-xs ml-2">(You)</Text>
            )}
          </View>
          <Text className="text-gray-500 text-xs">
            {tierEmojis[item.tier] ?? "🥉"}{" "}
            {item.tier.charAt(0).toUpperCase() + item.tier.slice(1)}
          </Text>
        </View>

        {/* Rating / Points */}
        <View className="items-end">
          <Text className="text-white font-bold text-lg">{item.rating}</Text>
          <Text className="text-gray-500 text-xs">
            {activeTab === "global" ? "rating" : "points"}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-dark" edges={["bottom"]}>
      {/* Tabs */}
      <View className="flex-row mx-4 mt-2 mb-4 bg-dark-card rounded-xl p-1">
        <Pressable
          onPress={() => setActiveTab("global")}
          className={`flex-1 py-2 rounded-lg ${
            activeTab === "global" ? "bg-primary" : ""
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              activeTab === "global" ? "text-white" : "text-gray-400"
            }`}
          >
            Global
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("weekly")}
          className={`flex-1 py-2 rounded-lg ${
            activeTab === "weekly" ? "bg-primary" : ""
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              activeTab === "weekly" ? "text-white" : "text-gray-400"
            }`}
          >
            Weekly League
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#39FF14" />
        </View>
      ) : (
        <FlatList
          data={leaderboard}
          renderItem={renderLeaderboardItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View className="px-4 mb-4">
              <Text className="text-gray-400 text-sm">
                {activeTab === "global"
                  ? "Top players worldwide"
                  : "Your league this week"}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View className="items-center py-12">
              <Text className="text-gray-500 text-base">
                {activeTab === "global"
                  ? "No players yet"
                  : "No league data this week"}
              </Text>
            </View>
          }
          ListFooterComponent={
            currentUserEntry ? (
              <View className="mt-4 mb-6">
                <View className="mx-4 mb-2">
                  <View className="flex-row items-center">
                    <View className="flex-1 h-px bg-dark-border" />
                    <Text className="text-gray-500 text-xs mx-3">Your Position</Text>
                    <View className="flex-1 h-px bg-dark-border" />
                  </View>
                </View>
                {renderLeaderboardItem({ item: currentUserEntry })}
              </View>
            ) : (
              <View className="h-6" />
            )
          }
        />
      )}
    </SafeAreaView>
  );
}
