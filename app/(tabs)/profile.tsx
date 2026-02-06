import { View, Text, Pressable, ScrollView, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Match } from "@/types/database";

const tierColors: Record<string, [string, string]> = {
  bronze: ["#CD7F32", "#8B4513"],
  silver: ["#C0C0C0", "#808080"],
  gold: ["#FFD700", "#DAA520"],
  diamond: ["#B9F2FF", "#4169E1"],
};

const tierNames: Record<string, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  diamond: "Diamond",
};

interface MatchHistoryItem {
  id: string;
  opponentName: string;
  playerScore: number;
  opponentScore: number;
  ratingChange: number | null;
  won: boolean;
  isBotMatch: boolean;
  date: string;
}

export default function ProfileScreen() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [matchHistory, setMatchHistory] = useState<MatchHistoryItem[]>([]);
  const [globalRank, setGlobalRank] = useState<number | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useFocusEffect(
    useCallback(() => {
      refreshProfile();
      if (user) {
        fetchMatchHistory(user.id);
        fetchGlobalRank();
      }
    }, [user])
  );

  const fetchGlobalRank = async () => {
    if (!profile) return;
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gt("rating", profile.rating);
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
        .limit(20);

      if (!matches || matches.length === 0) {
        setMatchHistory([]);
        return;
      }

      // Gather opponent IDs for human matches
      const opponentIds = matches
        .filter((m) => !m.is_bot_match)
        .map((m) => (m.player1_id === userId ? m.player2_id : m.player1_id))
        .filter(Boolean) as string[];

      let opponentMap: Record<string, string> = {};
      if (opponentIds.length > 0) {
        const { data: opponents } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", opponentIds);
        if (opponents) {
          opponentMap = Object.fromEntries(opponents.map((o) => [o.id, o.username]));
        }
      }

      const items: MatchHistoryItem[] = matches.map((m: Match) => {
        const isP1 = m.player1_id === userId;
        const opponentId = isP1 ? m.player2_id : m.player1_id;
        const playerScore = isP1 ? m.player1_score : m.player2_score;
        const opponentScore = isP1 ? m.player2_score : m.player1_score;
        const ratingChange = isP1 ? m.player1_rating_change : m.player2_rating_change;
        const won = m.winner_id === userId;

        let opponentName = "Bot";
        if (!m.is_bot_match && opponentId) {
          opponentName = opponentMap[opponentId] ?? "Opponent";
        }

        return {
          id: m.id,
          opponentName,
          playerScore,
          opponentScore,
          ratingChange,
          won,
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

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/auth");
        },
      },
    ]);
  };

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-dark items-center justify-center">
        <ActivityIndicator size="large" color="#6366F1" />
      </SafeAreaView>
    );
  }

  const wins = profile.wins ?? 0;
  const losses = profile.losses ?? 0;
  const totalMatches = wins + losses;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
  const tier = profile.tier ?? "bronze";
  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

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
    <SafeAreaView className="flex-1 bg-dark" edges={["bottom"]}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Profile Header */}
        <View className="items-center pt-6 pb-4">
          <View className="w-24 h-24 rounded-full bg-dark-card border-2 border-primary items-center justify-center mb-3">
            <FontAwesome5 name="user" size={40} color="#6366F1" />
          </View>

          <Text className="text-2xl font-bold text-white">@{profile.username}</Text>

          <LinearGradient
            colors={tierColors[tier] ?? tierColors.bronze}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="px-4 py-1 rounded-full mt-2"
          >
            <Text className="text-white font-bold text-sm">
              {tierNames[tier] ?? "Bronze"} Player
            </Text>
          </LinearGradient>

          <Text className="text-gray-500 text-sm mt-2">
            Member since {memberSince}
          </Text>
        </View>

        {/* Stats Grid */}
        <View className="mx-6 mt-4 bg-dark-card rounded-2xl p-5 border border-dark-border">
          <Text className="text-white font-bold text-lg mb-4">Statistics</Text>

          <View className="flex-row flex-wrap">
            <View className="w-1/2 mb-4">
              <Text className="text-gray-400 text-sm">Rating</Text>
              <Text className="text-white text-2xl font-bold">{profile.rating}</Text>
            </View>

            <View className="w-1/2 mb-4">
              <Text className="text-gray-400 text-sm">Global Rank</Text>
              <Text className="text-white text-2xl font-bold">
                {globalRank ? `#${globalRank}` : "--"}
              </Text>
            </View>

            <View className="w-1/2 mb-4">
              <Text className="text-gray-400 text-sm">Total Matches</Text>
              <Text className="text-white text-2xl font-bold">{totalMatches}</Text>
            </View>

            <View className="w-1/2 mb-4">
              <Text className="text-gray-400 text-sm">Win Rate</Text>
              <Text className="text-white text-2xl font-bold">{winRate}%</Text>
            </View>

            <View className="w-1/2 mb-4">
              <Text className="text-gray-400 text-sm">Wins</Text>
              <Text className="text-win text-2xl font-bold">{wins}</Text>
            </View>

            <View className="w-1/2 mb-4">
              <Text className="text-gray-400 text-sm">Losses</Text>
              <Text className="text-lose text-2xl font-bold">{losses}</Text>
            </View>

            <View className="w-1/2">
              <Text className="text-gray-400 text-sm">Streak Freezes</Text>
              <Text className="text-secondary text-2xl font-bold">
                {profile.streak_freezes ?? 0}
              </Text>
            </View>
          </View>
        </View>

        {/* Streak Card */}
        <View className="mx-6 mt-4 bg-dark-card rounded-2xl p-5 border border-dark-border">
          <View className="flex-row items-center mb-3">
            <Text className="text-2xl mr-2">🔥</Text>
            <Text className="text-white font-bold text-lg">Streak</Text>
          </View>

          <View className="flex-row justify-between">
            <View>
              <Text className="text-gray-400 text-sm">Current</Text>
              <Text className="text-accent text-3xl font-bold">
                {profile.current_streak ?? 0} days
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-gray-400 text-sm">Best</Text>
              <Text className="text-white text-3xl font-bold">
                {profile.best_streak ?? 0} days
              </Text>
            </View>
          </View>
        </View>

        {/* Match History */}
        <View className="mx-6 mt-4 bg-dark-card rounded-2xl p-5 border border-dark-border">
          <Text className="text-white font-bold text-lg mb-4">Recent Matches</Text>

          {loadingHistory ? (
            <ActivityIndicator size="small" color="#6366F1" />
          ) : matchHistory.length === 0 ? (
            <Text className="text-gray-500 text-center py-4">
              No matches yet. Go battle!
            </Text>
          ) : (
            matchHistory.map((match) => (
              <View
                key={match.id}
                className="flex-row items-center justify-between py-3 border-b border-dark-border last:border-b-0"
              >
                <View className="flex-row items-center flex-1">
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                      match.won ? "bg-win/20" : "bg-lose/20"
                    }`}
                  >
                    <Ionicons
                      name={match.won ? "trophy" : "close"}
                      size={16}
                      color={match.won ? "#22C55E" : "#EF4444"}
                    />
                  </View>
                  <View>
                    <Text className="text-white font-semibold">
                      vs {match.opponentName}
                      {match.isBotMatch ? " 🤖" : ""}
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      {match.playerScore}-{match.opponentScore} · {formatDate(match.date)}
                    </Text>
                  </View>
                </View>

                {match.ratingChange != null && (
                  <Text
                    className={`font-bold ${
                      match.ratingChange >= 0 ? "text-win" : "text-lose"
                    }`}
                  >
                    {match.ratingChange >= 0 ? "+" : ""}
                    {match.ratingChange}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>

        {/* Action Buttons */}
        <View className="mx-6 mt-6">
          <Pressable
            onPress={() => router.push("/modal")}
            className="flex-row items-center justify-center bg-dark-card rounded-xl p-4 border border-dark-border mb-3 active:bg-dark-border"
          >
            <Ionicons name="settings-outline" size={20} color="#6B7280" />
            <Text className="text-gray-400 font-semibold ml-2">Settings</Text>
          </Pressable>

          <Pressable
            onPress={handleSignOut}
            className="flex-row items-center justify-center bg-dark-card rounded-xl p-4 border border-lose/30 active:bg-lose/10"
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text className="text-lose font-semibold ml-2">Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
