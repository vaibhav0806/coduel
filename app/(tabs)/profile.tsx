import { View, Pressable, ScrollView, Alert, ActivityIndicator } from "react-native";
import { Text, TextBold, TextSemibold, TextMedium } from "@/components/ui/Text";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Match } from "@/types/database";
import { Logo } from "@/components/AnimatedLogo";

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
        .limit(10);

      if (!matches || matches.length === 0) {
        setMatchHistory([]);
        return;
      }

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
        <Logo size="small" />
        <ActivityIndicator size="small" color="#39FF14" style={{ marginTop: 16 }} />
      </SafeAreaView>
    );
  }

  const wins = profile.wins ?? 0;
  const losses = profile.losses ?? 0;
  const totalMatches = wins + losses;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
  const tier = profile.tier ?? "bronze";

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
        <Animated.View
          entering={FadeIn.duration(400)}
          className="items-center pt-6 pb-6 px-6"
        >
          {/* Avatar */}
          <View className="w-20 h-20 rounded-full bg-dark-card border-2 border-primary items-center justify-center mb-4">
            <TextBold className="text-primary text-3xl">
              {(profile.username?.[0] ?? "?").toUpperCase()}
            </TextBold>
          </View>

          <TextBold className="text-white text-2xl">@{profile.username}</TextBold>

          {/* Rating Badge */}
          <View className="flex-row items-center mt-3">
            <View className="bg-dark-card border border-primary/30 px-4 py-2 rounded-full">
              <View className="flex-row items-center">
                <Ionicons name="diamond-outline" size={14} color="#39FF14" />
                <TextBold className="text-primary text-sm ml-1.5">{profile.rating}</TextBold>
              </View>
            </View>
            {globalRank && (
              <View className="bg-dark-card border border-dark-border px-3 py-2 rounded-full ml-2">
                <Text className="text-gray-400 text-sm">#{globalRank} Global</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Quick Stats Grid */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          className="mx-6 mb-6"
        >
          <View className="flex-row">
            <View className="flex-1 bg-dark-card border border-dark-border rounded-xl p-4 mr-2 items-center">
              <TextBold className="text-win text-2xl">{wins}</TextBold>
              <Text className="text-gray-500 text-xs uppercase mt-1">Wins</Text>
            </View>
            <View className="flex-1 bg-dark-card border border-dark-border rounded-xl p-4 mr-2 items-center">
              <TextBold className="text-lose text-2xl">{losses}</TextBold>
              <Text className="text-gray-500 text-xs uppercase mt-1">Losses</Text>
            </View>
            <View className="flex-1 bg-dark-card border border-dark-border rounded-xl p-4 items-center">
              <TextBold className="text-white text-2xl">{winRate}%</TextBold>
              <Text className="text-gray-500 text-xs uppercase mt-1">Win Rate</Text>
            </View>
          </View>
        </Animated.View>

        {/* Streak Card */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          className="mx-6 mb-6"
        >
          <View className="bg-dark-card border border-dark-border rounded-xl p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="flame" size={20} color="#FF6B35" />
                <TextSemibold className="text-white ml-2">Streak</TextSemibold>
              </View>
              <View className="flex-row items-center">
                <View className="items-end mr-6">
                  <TextBold className="text-accent text-xl">{profile.current_streak ?? 0}</TextBold>
                  <Text className="text-gray-500 text-xs">Current</Text>
                </View>
                <View className="items-end">
                  <TextBold className="text-white text-xl">{profile.best_streak ?? 0}</TextBold>
                  <Text className="text-gray-500 text-xs">Best</Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Match History */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(400)}
          className="mx-6 mb-6"
        >
          <View className="flex-row items-center justify-between mb-3">
            <TextSemibold className="text-white">Recent Matches</TextSemibold>
            <Text className="text-gray-500 text-xs">{totalMatches} total</Text>
          </View>

          <View className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
            {loadingHistory ? (
              <View className="p-4 items-center">
                <ActivityIndicator size="small" color="#39FF14" />
              </View>
            ) : matchHistory.length === 0 ? (
              <View className="p-6 items-center">
                <Ionicons name="game-controller-outline" size={32} color="#6B7280" />
                <Text className="text-gray-500 text-sm mt-2">No matches yet</Text>
                <Text className="text-gray-600 text-xs mt-1">Play your first battle!</Text>
              </View>
            ) : (
              matchHistory.map((match, index) => (
                <View
                  key={match.id}
                  className={`flex-row items-center justify-between p-4 ${
                    index < matchHistory.length - 1 ? "border-b border-dark-border" : ""
                  }`}
                >
                  <View className="flex-row items-center flex-1">
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                        match.won ? "bg-win/20" : "bg-lose/20"
                      }`}
                    >
                      <Ionicons
                        name={match.won ? "checkmark" : "close"}
                        size={16}
                        color={match.won ? "#22C55E" : "#EF4444"}
                      />
                    </View>
                    <View className="flex-1">
                      <TextMedium className="text-white">
                        vs {match.opponentName}
                      </TextMedium>
                      <Text className="text-gray-500 text-xs">
                        {match.playerScore}-{match.opponentScore} • {formatDate(match.date)}
                      </Text>
                    </View>
                  </View>

                  {match.ratingChange != null && (
                    <TextSemibold
                      className={match.ratingChange >= 0 ? "text-win" : "text-lose"}
                    >
                      {match.ratingChange >= 0 ? "+" : ""}{match.ratingChange}
                    </TextSemibold>
                  )}
                </View>
              ))
            )}
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(400)}
          className="mx-6"
        >
          <Pressable
            onPress={() => router.push("/modal")}
            className="flex-row items-center justify-center bg-dark-card border border-dark-border rounded-xl p-4 mb-3 active:bg-dark-elevated"
          >
            <Ionicons name="settings-outline" size={18} color="#6B7280" />
            <TextMedium className="text-gray-400 ml-2">Settings</TextMedium>
          </Pressable>

          <Pressable
            onPress={handleSignOut}
            className="flex-row items-center justify-center bg-dark-card border border-lose/30 rounded-xl p-4 active:bg-lose/10"
          >
            <Ionicons name="log-out-outline" size={18} color="#EF4444" />
            <TextMedium className="text-lose ml-2">Sign Out</TextMedium>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
