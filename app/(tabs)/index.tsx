import { View, Text as RNText, Pressable, ScrollView, Modal, ActivityIndicator } from "react-native";
import { Text, TextBold, TextSemibold, TextMedium } from "@/components/ui/Text";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useCallback, useRef, useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  FadeInDown,
  FadeIn,
} from "react-native-reanimated";
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
import { LanguageSelector } from "@/components/LanguageSelector";

const tierColors: Record<string, [string, string]> = {
  bronze: ["#CD7F32", "#8B4513"],
  silver: ["#C0C0C0", "#808080"],
  gold: ["#FFD700", "#DAA520"],
  diamond: ["#B9F2FF", "#4169E1"],
};

const tierEmoji: Record<string, string> = {
  bronze: "🥉",
  silver: "🥈",
  gold: "🥇",
  diamond: "💎",
};

export default function HomeScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  const [matchmakingText, setMatchmakingText] = useState("Finding opponent...");
  const [leagueData, setLeagueData] = useState<{ points: number; position: number } | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Glow animation for battle button
  const glowOpacity = useSharedValue(0.4);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

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

    // Button press animation
    buttonScale.value = withSequence(
      withSpring(0.95, { damping: 15 }),
      withSpring(1, { damping: 15 })
    );

    setIsMatchmaking(true);
    setMatchmakingText("Finding opponent...");

    let navigated = false;

    console.log("[Matchmaking] Setting 5s bot fallback timer...");
    timeoutRef.current = setTimeout(async () => {
      timeoutRef.current = null;
      if (navigated) return;
      console.log("[Matchmaking] Timer fired, creating bot match...");
      setMatchmakingText("Creating bot match...");

      try {
        const botResult = await createBotMatch(user.id, true, selectedLanguage);
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

    try {
      console.log("[Matchmaking] Joining queue...");
      const result = await joinMatchQueue(user.id, true, selectedLanguage);
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
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsMatchmaking(false);

    if (user) {
      leaveMatchQueue(user.id).catch(() => {});
    }
  };

  const handlePractice = async () => {
    if (!user) return;

    setIsMatchmaking(true);
    setMatchmakingText("Starting practice...");

    try {
      const result = await createBotMatch(user.id, false, selectedLanguage);
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
  const streak = profile?.current_streak ?? 0;

  return (
    <SafeAreaView className="flex-1 bg-dark" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          entering={FadeIn.duration(400)}
          className="px-6 pt-4 pb-6"
        >
          <View className="flex-row items-center justify-between">
            <View>
              <TextMedium className="text-gray-500 text-xs uppercase tracking-widest">
                Welcome back
              </TextMedium>
              <TextBold className="text-white text-2xl mt-1">
                {profile?.username ?? "Coder"}
              </TextBold>
            </View>
            <View className="flex-row items-center">
              <LinearGradient
                colors={tierColors[tier] ?? tierColors.bronze}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="px-3 py-1.5 rounded-full flex-row items-center"
              >
                <RNText className="mr-1">{tierEmoji[tier] ?? "🥉"}</RNText>
                <TextBold className="text-white text-sm">{rating}</TextBold>
              </LinearGradient>
            </View>
          </View>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          className="mx-6 mb-6"
        >
          <View className="flex-row">
            <View className="flex-1 bg-dark-card border border-dark-border rounded-xl p-3 mr-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-500 text-xs uppercase tracking-wide">Wins</Text>
                <Ionicons name="trophy-outline" size={14} color="#10B981" />
              </View>
              <TextBold className="text-win text-xl mt-1">{wins}</TextBold>
            </View>
            <View className="flex-1 bg-dark-card border border-dark-border rounded-xl p-3 mr-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-500 text-xs uppercase tracking-wide">Losses</Text>
                <Ionicons name="close-circle-outline" size={14} color="#EF4444" />
              </View>
              <TextBold className="text-lose text-xl mt-1">{losses}</TextBold>
            </View>
            <View className="flex-1 bg-dark-card border border-dark-border rounded-xl p-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-500 text-xs uppercase tracking-wide">Streak</Text>
                <RNText className="text-sm">🔥</RNText>
              </View>
              <TextBold className="text-accent text-xl mt-1">{streak}</TextBold>
            </View>
          </View>
        </Animated.View>

        {/* Language Selector */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          className="px-6"
        >
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onSelect={setSelectedLanguage}
          />
        </Animated.View>

        {/* Battle Button */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(400)}
          className="mx-6 mt-2"
        >
          <Pressable onPress={handleBattle}>
            <Animated.View style={buttonAnimatedStyle}>
              {/* Glow effect */}
              <Animated.View
                style={glowStyle}
                className="absolute inset-0 rounded-2xl bg-primary"
                pointerEvents="none"
              />
              <LinearGradient
                colors={["#39FF14", "#2DD10D"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-2xl p-5 border border-primary/50"
              >
                <View className="flex-row items-center justify-center">
                  <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mr-3">
                    <Ionicons name="flash" size={24} color="#FFFFFF" />
                  </View>
                  <View>
                    <TextBold className="text-white text-2xl tracking-wide">
                      BATTLE
                    </TextBold>
                    <Text className="text-white/60 text-sm">
                      Find a worthy opponent
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          </Pressable>
        </Animated.View>

        {/* Practice Button */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(400)}
          className="mx-6 mt-3"
        >
          <Pressable
            onPress={handlePractice}
            className="bg-dark-card border border-dark-border rounded-xl p-4 flex-row items-center justify-center active:bg-dark-elevated"
          >
            <Ionicons name="barbell-outline" size={18} color="#6B7280" />
            <TextSemibold className="text-gray-400 ml-2">
              Practice Mode
            </TextSemibold>
            <Text className="text-gray-600 text-xs ml-2">• No rating change</Text>
          </Pressable>
        </Animated.View>

        {/* Weekly League */}
        <Animated.View
          entering={FadeInDown.delay(500).duration(400)}
          className="mx-6 mt-6"
        >
          <View className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-dark-border">
              <View className="flex-row items-center">
                <Ionicons name="podium-outline" size={18} color="#FF6B35" />
                <TextBold className="text-white ml-2">Weekly League</TextBold>
              </View>
              <View className="bg-accent/20 px-2 py-0.5 rounded-full">
                <TextMedium className="text-accent text-xs">
                  {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </TextMedium>
              </View>
            </View>

            {/* Content */}
            <View className="p-4">
              {leagueData ? (
                <View className="flex-row justify-around">
                  <View className="items-center">
                    <TextBold className="text-3xl text-white">
                      #{leagueData.position}
                    </TextBold>
                    <Text className="text-gray-500 text-xs uppercase tracking-wide mt-1">
                      Position
                    </Text>
                  </View>
                  <View className="w-px bg-dark-border" />
                  <View className="items-center">
                    <TextBold className="text-3xl text-primary">
                      {leagueData.points}
                    </TextBold>
                    <Text className="text-gray-500 text-xs uppercase tracking-wide mt-1">
                      Points
                    </Text>
                  </View>
                </View>
              ) : (
                <View className="items-center py-2">
                  <Text className="text-gray-500 text-sm">
                    Play a ranked match to join!
                  </Text>
                  <View className="flex-row items-center mt-2">
                    <Ionicons name="flash" size={14} color="#39FF14" />
                    <Text className="text-primary text-xs ml-1">
                      +15 points per win
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Animated.View>

      </ScrollView>

      {/* Matchmaking Overlay */}
      <Modal visible={isMatchmaking} transparent animationType="fade">
        <View className="flex-1 bg-black/90 items-center justify-center">
          <Animated.View
            entering={FadeIn.duration(300)}
            className="items-center"
          >
            {/* Animated rings */}
            <View className="relative w-32 h-32 items-center justify-center">
              <PulsingRing delay={0} />
              <PulsingRing delay={400} />
              <PulsingRing delay={800} />
              <View className="absolute w-16 h-16 bg-primary/20 rounded-full items-center justify-center">
                <Ionicons name="search" size={28} color="#39FF14" />
              </View>
            </View>

            <TextBold className="text-white text-xl mt-8">
              {matchmakingText}
            </TextBold>
            <Text className="text-gray-500 mt-2">
              Searching for a worthy opponent...
            </Text>

            <Pressable
              onPress={handleCancelMatchmaking}
              className="mt-8 px-8 py-3 border border-dark-border rounded-xl active:bg-dark-card"
            >
              <TextMedium className="text-gray-400">Cancel</TextMedium>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Animated pulsing ring component for matchmaking
function PulsingRing({ delay }: { delay: number }) {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0.8);

  useEffect(() => {
    const startAnimation = () => {
      scale.value = withRepeat(
        withTiming(2, { duration: 2000, easing: Easing.out(Easing.ease) }),
        -1,
        false
      );
      opacity.value = withRepeat(
        withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) }),
        -1,
        false
      );
    };

    const timeout = setTimeout(startAnimation, delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className="absolute w-16 h-16 rounded-full border-2 border-primary"
    />
  );
}
