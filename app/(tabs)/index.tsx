import { View, Text, Pressable, ScrollView, Modal, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useCallback, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  supabase,
  joinMatchQueue,
  createBotMatch,
  leaveMatchQueue,
  createMatchmakingChannel,
} from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import { getWeekStart } from "@/lib/league";

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

export default function HomeScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  const [matchmakingText, setMatchmakingText] = useState("Finding opponent...");
  const [leagueData, setLeagueData] = useState<{ points: number; position: number } | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refresh profile and league data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshProfile();
      if (user) {
        fetchLeagueData();
      }
    }, [user])
  );

  const fetchLeagueData = async () => {
    if (!user) return;
    const weekStart = getWeekStart();

    const { data: membership } = await supabase
      .from("league_memberships")
      .select("points, league_tier")
      .eq("user_id", user.id)
      .eq("week_start", weekStart)
      .single();

    if (!membership) {
      setLeagueData(null);
      return;
    }

    // Count players with more points in the same tier+week
    const { count } = await supabase
      .from("league_memberships")
      .select("id", { count: "exact", head: true })
      .eq("week_start", weekStart)
      .eq("league_tier", membership.league_tier)
      .gt("points", membership.points);

    setLeagueData({
      points: membership.points,
      position: (count ?? 0) + 1,
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const navigateToBattle = (
    matchId: string,
    opponentUsername: string,
    opponentRating: number,
    isBotMatch: boolean
  ) => {
    setIsMatchmaking(false);
    router.push({
      pathname: "/battle/[id]",
      params: {
        id: matchId,
        opponentUsername,
        opponentRating: String(opponentRating),
        isBotMatch: String(isBotMatch),
      },
    });
  };

  const handleBattle = async () => {
    if (!user) return;

    setIsMatchmaking(true);
    setMatchmakingText("Finding opponent...");

    // Track if we already navigated (to prevent double-navigation)
    let navigated = false;

    // Start bot fallback timer IMMEDIATELY — independent of queue call
    console.log("[Matchmaking] Setting 5s bot fallback timer...");
    timeoutRef.current = setTimeout(async () => {
      timeoutRef.current = null;
      if (navigated) return;
      console.log("[Matchmaking] Timer fired, creating bot match...");
      setMatchmakingText("Creating bot match...");

      try {
        const botResult = await createBotMatch(user.id, true);
        console.log("[Matchmaking] Bot match result:", JSON.stringify(botResult));
        if (navigated) return;
        navigated = true;

        if (channelRef.current) {
          channelRef.current.unsubscribe();
          channelRef.current = null;
        }

        navigateToBattle(
          botResult.match_id,
          botResult.opponent_username,
          botResult.opponent_rating,
          true
        );
      } catch (err) {
        console.error("[Matchmaking] Bot match failed:", err);
        if (!navigated) setIsMatchmaking(false);
      }
    }, 5000);

    // Try to find a human opponent in parallel
    try {
      console.log("[Matchmaking] Joining queue...");
      const result = await joinMatchQueue(user.id, true);
      console.log("[Matchmaking] Queue result:", JSON.stringify(result));

      if (result.status === "matched" && !navigated) {
        navigated = true;
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        navigateToBattle(
          result.match_id,
          result.opponent_username,
          result.opponent_rating,
          false
        );
        return;
      }

      // Queued — listen for match_found broadcast
      const channel = createMatchmakingChannel(user.id);
      channelRef.current = channel;

      channel
        .on("broadcast", { event: "match_found" }, ({ payload }) => {
          console.log("[Matchmaking] match_found event:", JSON.stringify(payload));
          if (navigated) return;
          navigated = true;

          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          channel.unsubscribe();
          channelRef.current = null;

          navigateToBattle(
            payload.match_id,
            payload.opponent_username,
            payload.opponent_rating,
            false
          );
        })
        .subscribe();
    } catch (err) {
      console.error("[Matchmaking] Queue failed (bot fallback will handle it):", err);
    }
  };

  const handleCancelMatchmaking = () => {
    // Clean up immediately — don't block on the network call
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsMatchmaking(false);

    // Fire-and-forget queue removal
    if (user) {
      leaveMatchQueue(user.id).catch(() => {});
    }
  };

  const handlePractice = async () => {
    if (!user) return;

    setIsMatchmaking(true);
    setMatchmakingText("Starting practice...");

    try {
      const result = await createBotMatch(user.id, false);
      navigateToBattle(
        result.match_id,
        result.opponent_username,
        result.opponent_rating,
        true
      );
    } catch (err) {
      console.error("Practice match failed:", err);
      setIsMatchmaking(false);
    }
  };

  const rating = profile?.rating ?? 0;
  const tier = profile?.tier ?? "bronze";
  const wins = profile?.wins ?? 0;
  const losses = profile?.losses ?? 0;
  const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="px-6 pt-4 pb-2">
          <Text className="text-3xl font-bold text-white text-center">
            CODUEL
          </Text>
        </View>

        {/* Streak Banner */}
        {(profile?.current_streak ?? 0) > 0 && (
          <View className="mx-6 mt-4 bg-dark-card rounded-2xl p-4 border border-accent/30">
            <View className="flex-row items-center justify-center">
              <Text className="text-4xl mr-2">🔥</Text>
              <Text className="text-2xl font-bold text-accent">
                {profile!.current_streak} day streak
              </Text>
            </View>
            <Text className="text-gray-400 text-center mt-1">
              Best: {profile!.best_streak} days
            </Text>
            {(profile!.streak_freezes ?? 0) > 0 && (
              <Text className="text-blue-300 text-center mt-1">
                ❄️ {profile!.streak_freezes} freeze{profile!.streak_freezes === 1 ? "" : "s"} remaining
              </Text>
            )}
          </View>
        )}

        {/* Stats Card */}
        <View className="mx-6 mt-4 bg-dark-card rounded-2xl p-5 border border-dark-border">
          {/* Rating & Tier */}
          <View className="items-center mb-4">
            <LinearGradient
              colors={tierColors[tier] ?? tierColors.bronze}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="px-4 py-1 rounded-full mb-2"
            >
              <Text className="text-white font-bold text-sm">
                {tierNames[tier] ?? "Bronze"}
              </Text>
            </LinearGradient>
            <Text className="text-5xl font-bold text-white">{rating}</Text>
            <Text className="text-gray-400 mt-1">Rating</Text>
          </View>

          {/* Win/Loss Stats */}
          <View className="flex-row justify-around mt-4 pt-4 border-t border-dark-border">
            <View className="items-center">
              <Text className="text-2xl font-bold text-win">{wins}</Text>
              <Text className="text-gray-400 text-sm">Wins</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-lose">{losses}</Text>
              <Text className="text-gray-400 text-sm">Losses</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-white">{winRate}%</Text>
              <Text className="text-gray-400 text-sm">Win Rate</Text>
            </View>
          </View>
        </View>

        {/* Battle Button */}
        <Pressable onPress={handleBattle} className="mx-6 mt-6 active:scale-95">
          <LinearGradient
            colors={["#6366F1", "#4F46E5"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-2xl p-5"
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="flash" size={28} color="white" />
              <Text className="text-white text-2xl font-bold ml-2">
                BATTLE
              </Text>
            </View>
            <Text className="text-white/70 text-center mt-1">
              Find a duel
            </Text>
          </LinearGradient>
        </Pressable>

        {/* Practice Button */}
        <Pressable
          onPress={handlePractice}
          className="mx-6 mt-3 bg-dark-card rounded-2xl p-4 border border-dark-border active:bg-dark-border"
        >
          <View className="flex-row items-center justify-center">
            <FontAwesome5 name="dumbbell" size={18} color="#6B7280" />
            <Text className="text-gray-400 text-lg font-semibold ml-2">
              Practice Mode
            </Text>
          </View>
        </Pressable>

        {/* Weekly League Card */}
        <View className="mx-6 mt-6 bg-dark-card rounded-2xl p-5 border border-dark-border">
          <View className="flex-row items-center mb-3">
            <Ionicons name="trophy" size={20} color="#F59E0B" />
            <Text className="text-white font-bold text-lg ml-2">
              This Week
            </Text>
          </View>

          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-gray-400 text-sm">League</Text>
              <Text className="text-white font-semibold">
                {tierNames[tier] ?? "Bronze"}
              </Text>
            </View>
            <View>
              <Text className="text-gray-400 text-sm">Position</Text>
              <Text className="text-white font-semibold">
                {leagueData ? `#${leagueData.position}` : "--"}
              </Text>
            </View>
            <View>
              <Text className="text-gray-400 text-sm">Points</Text>
              <Text className="text-white font-semibold">
                {leagueData ? leagueData.points : "--"}
              </Text>
            </View>
          </View>
          {!leagueData && (
            <Text className="text-gray-500 text-xs text-center mt-2">
              Play a ranked match to join!
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Matchmaking Overlay */}
      <Modal visible={isMatchmaking} transparent animationType="fade">
        <View className="flex-1 bg-black/80 items-center justify-center">
          <View className="bg-dark-card rounded-2xl p-8 mx-8 items-center border border-dark-border">
            <ActivityIndicator size="large" color="#6366F1" />
            <Text className="text-white text-xl font-bold mt-4">
              {matchmakingText}
            </Text>
            <Text className="text-gray-400 mt-2 text-center">
              Searching for a worthy opponent
            </Text>
            <Pressable
              onPress={handleCancelMatchmaking}
              className="mt-6 px-8 py-3 bg-dark border border-dark-border rounded-xl"
            >
              <Text className="text-gray-400 font-semibold">Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
