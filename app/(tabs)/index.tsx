import {
  View,
  Pressable,
  ScrollView,
  Modal,
  RefreshControl,
  Text as RNText,
  useWindowDimensions,
} from "react-native";
import { Text, TextBold, TextSemibold, TextMedium } from "@/components/ui/Text";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback, useRef, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  interpolate,
  Easing,
  FadeInDown,
  FadeIn,
  ZoomIn,
} from "react-native-reanimated";
import { useAuth } from "@/contexts/AuthContext";
import { useMilestones } from "@/hooks/useMilestones";
import { MilestoneToastQueue } from "@/components/MilestoneToast";
import { Skeleton, useSkeletonAnimation } from "@/components/ui/Skeleton";
import {
  supabase,
  joinMatchQueue,
  createBotMatch,
  leaveMatchQueue,
  createMatchmakingChannel,
  tryMatchFromQueue,
} from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import { Match } from "@/types/database";
import { getWeekStart } from "@/lib/league";
import { getTierConfig } from "@/lib/rating";
import { LanguageSelector } from "@/components/LanguageSelector";

interface RecentMatch {
  id: string;
  opponentName: string;
  playerScore: number;
  opponentScore: number;
  ratingChange: number | null;
  won: boolean;
}

export default function HomeScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const { milestones, checkMilestones, clearMilestones } = useMilestones();
  const { width: screenWidth } = useWindowDimensions();
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  const [matchmakingText, setMatchmakingText] = useState("Finding opponent...");
  const [leagueData, setLeagueData] = useState<{
    points: number;
    position: number;
    topPlayers: { username: string; points: number; isMe: boolean }[];
  } | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(
    profile?.preferred_language ?? null
  );
  const [recentMatches, setRecentMatches] = useState<RecentMatch[]>([]);
  const [displayRating, setDisplayRating] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasAnimated = useRef(false);

  const buttonScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.15);
  const progressWidth = useSharedValue(0);
  const glowPulse = useSharedValue(0);
  const shimmerX = useSharedValue(-100);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
  }));

  // Battle button — pulsing glow aura
  const pulseGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowPulse.value, [0, 1], [0.08, 0.4]),
    transform: [
      { scaleX: interpolate(glowPulse.value, [0, 1], [0.98, 1.05]) },
      { scaleY: interpolate(glowPulse.value, [0, 1], [0.9, 1.15]) },
    ],
  }));

  // Battle button — shimmer sweep
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
  }));

  // Rating count-up animation
  const rating = profile?.rating ?? 0;
  const tier = profile?.tier ?? "bronze";
  const wins = profile?.wins ?? 0;
  const losses = profile?.losses ?? 0;
  const streak = profile?.current_streak ?? 0;
  const bestStreak = profile?.best_streak ?? 0;
  const level = profile?.level ?? 1;
  const streakFreezes = profile?.streak_freezes ?? 0;
  const winRate =
    wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;

  const tierConfig = getTierConfig(rating);
  const totalGames = wins + losses;

  // Contextual motivation message
  const getMotivationMessage = (): { text: string; color: string } | null => {
    const ratingToSilver = 1000 - rating;
    const ratingToGold = 1500 - rating;
    const ratingToDiamond = 2000 - rating;

    if (streak >= 3) {
      return {
        text: `${streak} win streak! You're on fire!`,
        color: "#FF6B35",
      };
    }
    if (rating < 1000 && ratingToSilver <= 100) {
      return { text: `${ratingToSilver} rating to Silver!`, color: "#C0C0C0" };
    }
    if (rating >= 1000 && rating < 1500 && ratingToGold <= 150) {
      return { text: `${ratingToGold} rating to Gold!`, color: "#FFD700" };
    }
    if (rating >= 1500 && rating < 2000 && ratingToDiamond <= 200) {
      return {
        text: `${ratingToDiamond} rating to Diamond!`,
        color: "#B9F2FF",
      };
    }
    if (winRate >= 75 && totalGames >= 5) {
      return { text: `${winRate}% win rate — dominant!`, color: "#10B981" };
    }
    if (bestStreak > 0 && streak === bestStreak && streak >= 2) {
      return { text: "New personal best streak!", color: "#FF6B35" };
    }
    return null;
  };

  const motivation = getMotivationMessage();

  // Sync preferred language from profile
  useEffect(() => {
    if (profile && profile.preferred_language !== undefined) {
      setSelectedLanguage(profile.preferred_language);
    }
  }, [profile?.preferred_language]);

  useEffect(() => {
    if (rating === 0 || hasAnimated.current) {
      setDisplayRating(rating);
      return;
    }
    hasAnimated.current = true;

    const duration = 800;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOut curve
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayRating(Math.round(eased * rating));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [rating]);

  // Breathing glow animation for battle button
  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.15, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);

  // Progress bar animation
  useEffect(() => {
    const targetProgress = tierConfig.progress * 100;
    progressWidth.value = withTiming(targetProgress, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [tierConfig.progress]);

  // Battle button idle animations
  useEffect(() => {
    // Breathing glow aura
    glowPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
    // Shimmer sweep with pause between - use screen width to ensure full sweep
    shimmerX.value = withRepeat(
      withSequence(
        withDelay(
          3500,
          withTiming(screenWidth, {
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        withTiming(-100, { duration: 0 }),
      ),
      -1,
    );
  }, [screenWidth]);

  // Refresh profile and league data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshProfile();
      if (user) {
        fetchLeagueData();
        fetchRecentMatches();
      }
    }, [user]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refreshProfile(),
      user ? fetchLeagueData() : Promise.resolve(),
      user ? fetchRecentMatches() : Promise.resolve(),
    ]);
    setRefreshing(false);
  }, [user]);

  // Check for milestones when profile updates
  useEffect(() => {
    checkMilestones(profile);
  }, [profile]);

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

    // Fetch top 3 players in this league tier
    const { data: topMembers } = await supabase
      .from("league_memberships")
      .select("user_id, points")
      .eq("week_start", weekStart)
      .eq("league_tier", membership.league_tier)
      .order("points", { ascending: false })
      .limit(3);

    let topPlayers: { username: string; points: number; isMe: boolean }[] = [];
    if (topMembers && topMembers.length > 0) {
      const userIds = topMembers.map((m) => m.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", userIds);

      const profileMap: Record<string, string> = {};
      if (profiles) {
        for (const p of profiles) profileMap[p.id] = p.username;
      }

      topPlayers = topMembers.map((m) => ({
        username: profileMap[m.user_id] ?? "Unknown",
        points: m.points,
        isMe: m.user_id === user.id,
      }));
    }

    setLeagueData({
      points: membership.points,
      position: (count ?? 0) + 1,
      topPlayers,
    });
  };

  const fetchRecentMatches = async () => {
    if (!user) return;

    const { data: matches } = await supabase
      .from("matches")
      .select("*")
      .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
      .not("ended_at", "is", null)
      .order("ended_at", { ascending: false })
      .limit(10);

    if (!matches || matches.length === 0) {
      setRecentMatches([]);
      return;
    }

    const opponentIds = matches
      .filter((m: Match) => !m.is_bot_match)
      .map((m: Match) =>
        m.player1_id === user.id ? m.player2_id : m.player1_id,
      )
      .filter(Boolean) as string[];

    let opponentMap: Record<string, string> = {};
    if (opponentIds.length > 0) {
      const { data: opponents } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", opponentIds);
      if (opponents) {
        opponentMap = Object.fromEntries(
          opponents.map((o) => [o.id, o.username]),
        );
      }
    }

    const items: RecentMatch[] = matches.map((m: Match) => {
      const isP1 = m.player1_id === user.id;
      const opponentId = isP1 ? m.player2_id : m.player1_id;
      return {
        id: m.id,
        opponentName: m.is_bot_match
          ? "Bot"
          : opponentId && opponentMap[opponentId]
            ? opponentMap[opponentId]
            : "Opponent",
        playerScore: isP1 ? m.player1_score : m.player2_score,
        opponentScore: isP1 ? m.player2_score : m.player1_score,
        ratingChange: isP1 ? m.player1_rating_change : m.player2_rating_change,
        won: m.winner_id === user.id,
      };
    });

    setRecentMatches(items);
  };

  const cleanupMatchmaking = () => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanupMatchmaking();
  }, []);

  const navigateToBattle = (
    matchId: string,
    opponentUsername: string,
    opponentRating: number,
    isBotMatch: boolean,
  ) => {
    setIsMatchmaking(false);
    router.push({
      pathname: "/battle/[id]",
      params: {
        id: matchId,
        opponentUsername,
        opponentRating: opponentRating.toString(),
        isBotMatch: isBotMatch.toString(),
      },
    });
  };

  const handleBattle = async () => {
    if (!user) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsMatchmaking(true);
    setMatchmakingText("Finding opponent...");

    let navigated = false;

    // 1. Subscribe to broadcast channel FIRST (before joining queue)
    //    Prevents missing match_found if opponent finds us during joinMatchQueue
    const channel = createMatchmakingChannel(user.id);
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "match_found" }, ({ payload }) => {
        if (navigated) return;
        navigated = true;
        cleanupMatchmaking();
        navigateToBattle(
          payload.match_id,
          payload.opponent_username,
          payload.opponent_rating,
          false,
        );
      })
      .subscribe();

    // 2. Start creating bot match in the background
    const botMatchPromise = createBotMatch(user.id, true, selectedLanguage);

    // 3. Bot fallback after 10s
    timeoutRef.current = setTimeout(async () => {
      if (navigated) return;
      navigated = true;
      cleanupMatchmaking();

      try {
        const result = await botMatchPromise;
        navigateToBattle(
          result.match_id,
          result.opponent_username,
          result.opponent_rating,
          true,
        );
      } catch (err) {
        console.error("[Matchmaking] Bot fallback failed:", err);
        setIsMatchmaking(false);
      }
    }, 10000);

    // 4. Join the match queue
    try {
      const result = await joinMatchQueue(user.id, true, selectedLanguage);

      if (result.status === "matched") {
        navigated = true;
        cleanupMatchmaking();
        navigateToBattle(
          result.match_id,
          result.opponent_username,
          result.opponent_rating,
          false,
        );
        return;
      }

      // 5. Start polling every 2s for opponents who joined after us
      //    Handles the race where both players insert simultaneously
      pollRef.current = setInterval(async () => {
        if (navigated) {
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
          return;
        }

        try {
          const match = await tryMatchFromQueue(
            user.id,
            true,
            selectedLanguage,
          );
          if (match && !navigated) {
            navigated = true;
            cleanupMatchmaking();
            navigateToBattle(
              match.match_id,
              match.opponent_username,
              match.opponent_rating,
              false,
            );
          }
        } catch (err) {
          console.error("[Matchmaking] Poll error:", err);
        }
      }, 2000);
    } catch (err) {
      console.error("[Matchmaking] Queue failed:", err);
    }
  };

  const handleCancelMatchmaking = () => {
    cleanupMatchmaking();
    setIsMatchmaking(false);

    if (user) {
      leaveMatchQueue(user.id).catch(() => {});
    }
  };

  const handlePractice = async () => {
    if (!user) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsMatchmaking(true);
    setMatchmakingText("Starting practice...");

    try {
      const result = await createBotMatch(user.id, false, selectedLanguage);
      navigateToBattle(
        result.match_id,
        result.opponent_username,
        result.opponent_rating,
        true,
      );
    } catch (err) {
      console.error("Practice match failed:", err);
      setIsMatchmaking(false);
    }
  };

  // Days left in the week (week resets Monday)
  const getDaysLeft = () => {
    const now = new Date();
    const day = now.getDay(); // 0=Sun
    // Days until next Monday
    const daysUntilMonday = day === 0 ? 1 : 8 - day;
    return daysUntilMonday;
  };

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%` as any,
  }));

  if (!profile) {
    return <HomeLoadingSkeleton />;
  }

  return (
    <SafeAreaView className="flex-1 bg-dark" edges={["top"]}>
      {/* Background atmosphere gradient */}
      <LinearGradient
        colors={["#050508", "#080812", "#050508"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

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
        {/* Section 1: Minimal Top Bar */}
        <Animated.View
          entering={FadeIn.duration(300)}
          className="px-6 pt-3 pb-2 flex-row items-center justify-between"
        >
          <TextMedium className="text-gray-400 text-sm">
            @{profile?.username ?? "coder"}
          </TextMedium>
          {streakFreezes > 0 && (
            <View className="flex-row items-center bg-dark-card border border-dark-border rounded-full px-3 py-1">
              <Ionicons name="snow" size={16} color="#67E8F9" style={{ marginRight: 4 }} />
              <TextSemibold className="text-cyan-300 text-xs">
                {streakFreezes}
              </TextSemibold>
            </View>
          )}
        </Animated.View>

        {/* Section 2: Rating Hero Zone */}
        <Animated.View className="items-center px-6 pt-4 pb-2">
          {/* Tier Badge */}
          <Animated.View entering={ZoomIn.delay(100).duration(400)}>
            <LinearGradient
              colors={tierConfig.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 6,
              }}
            >
              <TextBold
                style={{ fontSize: 12, color: "#050508", letterSpacing: 1 }}
              >
                {tierConfig.label.toUpperCase()}
              </TextBold>
            </LinearGradient>
          </Animated.View>

          {/* Rating Number */}
          <Animated.View entering={FadeIn.duration(300)}>
            <TextBold
              style={{
                fontSize: 56,
                color: "#FFFFFF",
                lineHeight: 66,
                marginTop: 8,
              }}
            >
              {displayRating.toLocaleString()}
            </TextBold>
          </Animated.View>

          {/* Level */}
          <Text className="text-gray-500 text-xs mt-0.5">Level {level}</Text>

          {/* Progress Bar */}
          <View className="w-full mt-4 px-4">
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
            <View className="flex-row justify-between mt-1.5">
              <Text className="text-gray-600 text-xs">{tierConfig.floor}</Text>
              <Text className="text-gray-600 text-xs">
                {tierConfig.ceiling === tierConfig.floor
                  ? "MAX"
                  : tierConfig.ceiling}
              </Text>
            </View>
          </View>

          {/* Motivation Message */}
          {motivation && (
            <Animated.View
              entering={FadeIn.delay(400).duration(300)}
              className="mt-4"
            >
              <TextSemibold
                style={{
                  fontSize: 13,
                  color: motivation.color,
                  textAlign: "center",
                }}
              >
                {motivation.text}
              </TextSemibold>
            </Animated.View>
          )}

          {/* Mini Stats Row */}
          <Animated.View
            entering={FadeIn.delay(500).duration(300)}
            className="flex-row items-center mt-4"
          >
            {/* Win Rate */}
            <View className="items-center px-4">
              <TextBold
                style={{
                  fontSize: 16,
                  color: winRate >= 50 ? "#10B981" : "#EF4444",
                }}
              >
                {winRate}%
              </TextBold>
              <Text
                className="text-gray-500 text-xs mt-0.5"
                style={{ fontSize: 10, letterSpacing: 1 }}
              >
                WIN RATE
              </Text>
            </View>

            <View
              style={{
                width: 1,
                height: 24,
                backgroundColor: "rgba(255,255,255,0.08)",
              }}
            />

            {/* Streak */}
            <View className="items-center px-4">
              <TextBold style={{ fontSize: 16, color: "#FF6B35" }}>
                <Ionicons name="flame" size={16} color="#FF6B35" />{" "}{streak}
              </TextBold>
              <Text
                className="text-gray-500 text-xs mt-0.5"
                style={{ fontSize: 10, letterSpacing: 1 }}
              >
                STREAK
              </Text>
            </View>

            <View
              style={{
                width: 1,
                height: 24,
                backgroundColor: "rgba(255,255,255,0.08)",
              }}
            />

            {/* Rank */}
            <View className="items-center px-4">
              <TextBold style={{ fontSize: 16, color: "#FFFFFF" }}>
                #{leagueData?.position ?? "—"}
              </TextBold>
              <Text
                className="text-gray-500 text-xs mt-0.5"
                style={{ fontSize: 10, letterSpacing: 1 }}
              >
                RANK
              </Text>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Section 3: Battle Button */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          className="mx-6 mt-6"
        >
          <Pressable
            onPress={handleBattle}
            onPressIn={() => {
              buttonScale.value = withSpring(0.96, {
                damping: 15,
                stiffness: 400,
              });
            }}
            onPressOut={() => {
              buttonScale.value = withSpring(1, {
                damping: 15,
                stiffness: 400,
              });
            }}
          >
            <Animated.View style={buttonAnimatedStyle}>
              {/* Gradient border wrapper */}
              <LinearGradient
                colors={["#39FF14", "#1A7A2E", "#0B4D18", "#1A7A2E", "#39FF14"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 18, padding: 1.5 }}
              >
                {/* Inner button surface */}
                <LinearGradient
                  colors={["#132E16", "#0E1F10", "#091509"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={{
                    borderRadius: 16.5,
                    paddingVertical: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {/* Shimmer sweep */}
                  <Animated.View
                    style={[
                      {
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        width: 80,
                        opacity: 0.1,
                      },
                      shimmerStyle,
                    ]}
                  >
                    <LinearGradient
                      colors={["transparent", "#39FF14", "transparent"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ flex: 1 }}
                    />
                  </Animated.View>

                  {/* Top edge highlight */}
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 24,
                      right: 24,
                      height: 1,
                      backgroundColor: "rgba(57, 255, 20, 0.12)",
                    }}
                  />

                  {/* Content */}
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons
                      name="flash"
                      size={20}
                      color="#39FF14"
                      style={{ marginRight: 10, opacity: 0.8 }}
                    />
                    <RNText
                      style={{
                        fontFamily: "Teko_700Bold",
                        fontSize: 36,
                        color: "#FFFFFF",
                        letterSpacing: 8,
                      }}
                    >
                      BATTLE
                    </RNText>
                    <Ionicons
                      name="flash"
                      size={20}
                      color="#39FF14"
                      style={{ marginLeft: 10, opacity: 0.8 }}
                    />
                  </View>
                  <TextSemibold
                    style={{
                      fontSize: 11,
                      color: "rgba(57, 255, 20, 0.5)",
                      marginTop: 4,
                      letterSpacing: 2,
                    }}
                  >
                    RANKED MATCH
                  </TextSemibold>
                </LinearGradient>
              </LinearGradient>
            </Animated.View>
          </Pressable>
        </Animated.View>

        {/* Section 4: Secondary Actions Row */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(300)}
          style={{ flexDirection: "row", marginHorizontal: 24, marginTop: 12 }}
        >
          {/* Practice Button */}
          <Pressable
            onPress={handlePractice}
            style={{ flex: 1, marginRight: 8 }}
          >
            <View className="bg-dark-card border border-dark-border rounded-xl p-3 flex-row items-center justify-center">
              <Ionicons name="barbell-outline" size={16} color="#6B7280" />
              <TextSemibold className="text-gray-400 text-sm ml-2">
                Practice
              </TextSemibold>
              <Text className="text-gray-600 text-xs ml-1.5">· Unranked</Text>
            </View>
          </Pressable>

          {/* Language Selector (compact) */}
          <View style={{ flex: 1 }}>
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onSelect={setSelectedLanguage}
              compact
            />
          </View>
        </Animated.View>

        {/* Section 5: Weekly League Card */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(300)}
          className="mx-6 mt-3"
        >
          <Pressable onPress={() => router.push("/(tabs)/leaderboard")}>
            <View className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
              {/* Top accent gradient line */}
              <LinearGradient
                colors={tierConfig.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ height: 3 }}
              />

              {/* Header row */}
              <View className="flex-row items-center justify-between px-4 pt-3 pb-2">
                <View className="flex-row items-center">
                  <Ionicons name="trophy" size={16} color="#F59E0B" style={{ marginRight: 8 }} />
                  <TextBold className="text-white text-sm">
                    Weekly League
                  </TextBold>
                </View>
                <View className="flex-row items-center">
                  <LinearGradient
                    colors={tierConfig.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      borderRadius: 12,
                      paddingHorizontal: 10,
                      paddingVertical: 3,
                    }}
                  >
                    <TextBold style={{ fontSize: 10, color: "#050508" }}>
                      {tierConfig.label}
                    </TextBold>
                  </LinearGradient>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="#6B7280"
                    style={{ marginLeft: 8 }}
                  />
                </View>
              </View>

              {/* Content */}
              <View className="px-4 pb-4 pt-1">
                {leagueData ? (
                  <>
                    {/* Position & Points row */}
                    <View className="flex-row justify-around items-center">
                      <View className="items-center">
                        <TextBold className="text-3xl text-white">
                          #{leagueData.position}
                        </TextBold>
                        <Text
                          className="text-gray-500 mt-1"
                          style={{ fontSize: 10, letterSpacing: 1 }}
                        >
                          POSITION
                        </Text>
                      </View>
                      <View
                        style={{
                          width: 1,
                          height: 36,
                          backgroundColor: "rgba(255,255,255,0.08)",
                        }}
                      />
                      <View className="items-center">
                        <TextBold className="text-3xl text-primary">
                          {leagueData.points}
                        </TextBold>
                        <Text
                          className="text-gray-500 mt-1"
                          style={{ fontSize: 10, letterSpacing: 1 }}
                        >
                          POINTS
                        </Text>
                      </View>
                    </View>

                    <Text className="text-gray-600 text-xs text-center mt-3">
                      {getDaysLeft()} days left
                    </Text>
                  </>
                ) : (
                  <View className="items-center py-2">
                    <Text className="text-gray-500 text-sm">
                      Play a ranked match to join!
                    </Text>
                    <Text className="text-primary text-xs mt-1.5">
                      +3 points per win
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        </Animated.View>

        {/* Section 6: Recent Matches */}
        <Animated.View
          entering={FadeInDown.delay(500).duration(300)}
          className="mx-6 mt-3"
        >
          <View className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 pt-3 pb-2">
              <TextBold className="text-white text-sm">Recent</TextBold>
              <TextMedium style={{ fontSize: 12, color: "#6B7280" }}>
                {wins}W · {losses}L
              </TextMedium>
            </View>

            {recentMatches.length > 0 ? (
              <>
                {/* W/L indicator strip */}
                <View className="flex-row px-4 pb-3" style={{ gap: 4 }}>
                  {recentMatches.map((m) => (
                    <View
                      key={m.id}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        backgroundColor: m.won
                          ? "rgba(16, 185, 129, 0.15)"
                          : "rgba(239, 68, 68, 0.15)",
                        borderWidth: 1,
                        borderColor: m.won
                          ? "rgba(16, 185, 129, 0.3)"
                          : "rgba(239, 68, 68, 0.3)",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <TextBold
                        style={{
                          fontSize: 9,
                          color: m.won ? "#10B981" : "#EF4444",
                        }}
                      >
                        {m.won ? "W" : "L"}
                      </TextBold>
                    </View>
                  ))}
                </View>

                {/* Last 3 match rows */}
                {recentMatches.slice(0, 3).map((m) => (
                  <Pressable
                    key={`row-${m.id}`}
                    onPress={() =>
                      router.push({
                        pathname: "/match/[id]",
                        params: { id: m.id },
                      })
                    }
                    className="flex-row items-center px-4 py-2.5"
                    style={{
                      borderTopWidth: 1,
                      borderTopColor: "rgba(255,255,255,0.06)",
                    }}
                  >
                    {/* Left accent bar */}
                    <View
                      style={{
                        width: 3,
                        height: 28,
                        borderRadius: 1.5,
                        backgroundColor: m.won ? "#10B981" : "#EF4444",
                        marginRight: 10,
                      }}
                    />
                    <View className="flex-1">
                      <TextMedium className="text-white text-sm">
                        vs {m.opponentName}
                      </TextMedium>
                    </View>
                    <Text className="text-gray-600 text-xs mr-3">
                      {m.playerScore}–{m.opponentScore}
                    </Text>
                    <TextSemibold
                      style={{
                        fontSize: 13,
                        color: m.won ? "#10B981" : "#EF4444",
                        minWidth: 32,
                        textAlign: "right",
                      }}
                    >
                      {m.ratingChange != null && m.ratingChange > 0 ? "+" : ""}
                      {m.ratingChange ?? "—"}
                    </TextSemibold>
                    <Ionicons
                      name="chevron-forward"
                      size={14}
                      color="#4B5563"
                      style={{ marginLeft: 6 }}
                    />
                  </Pressable>
                ))}

                {/* View all link */}
                <Pressable
                  onPress={() => router.push("/(tabs)/profile")}
                  style={{
                    borderTopWidth: 1,
                    borderTopColor: "rgba(255,255,255,0.06)",
                  }}
                >
                  <View className="flex-row items-center justify-center py-2.5">
                    <Text className="text-gray-500 text-xs mr-1">View all</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={12}
                      color="#6B7280"
                    />
                  </View>
                </Pressable>
              </>
            ) : (
              <View className="items-center px-4 pb-4 pt-1">
                <Text className="text-gray-500 text-sm">
                  No matches yet — hit Battle!
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Milestone Toasts */}
      <MilestoneToastQueue
        milestones={milestones}
        onComplete={clearMilestones}
      />

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
              className="mt-8 px-8 py-3 bg-dark-card border border-dark-border rounded-xl active:bg-dark-elevated"
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
        false,
      );
      opacity.value = withRepeat(
        withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) }),
        -1,
        false,
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
      className="absolute w-32 h-32 rounded-full border-2 border-primary"
    />
  );
}

function HomeLoadingSkeleton() {
  const shimmer = useSkeletonAnimation();

  return (
    <SafeAreaView className="flex-1 bg-dark" edges={["top"]}>
      <LinearGradient
        colors={["#050508", "#080812", "#050508"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View className="px-6 pt-3 pb-2 flex-row items-center justify-between">
          <Skeleton
            width={80}
            height={14}
            borderRadius={4}
            shimmerValue={shimmer}
          />
        </View>

        {/* Rating hero zone */}
        <View className="items-center px-6 pt-4 pb-2">
          {/* Tier badge */}
          <Skeleton
            width={80}
            height={28}
            borderRadius={14}
            shimmerValue={shimmer}
          />
          {/* Rating number */}
          <Skeleton
            width={140}
            height={56}
            borderRadius={8}
            shimmerValue={shimmer}
            style={{ marginTop: 8 }}
          />
          {/* Level */}
          <Skeleton
            width={50}
            height={12}
            borderRadius={4}
            shimmerValue={shimmer}
            style={{ marginTop: 4 }}
          />
          {/* Progress bar */}
          <View className="w-full mt-4 px-4">
            <Skeleton
              width="100%"
              height={4}
              borderRadius={2}
              shimmerValue={shimmer}
            />
            <View className="flex-row justify-between mt-1.5">
              <Skeleton
                width={24}
                height={10}
                borderRadius={4}
                shimmerValue={shimmer}
              />
              <Skeleton
                width={32}
                height={10}
                borderRadius={4}
                shimmerValue={shimmer}
              />
            </View>
          </View>
          {/* Mini stats row */}
          <View className="flex-row items-center mt-4">
            <View className="items-center px-4">
              <Skeleton
                width={36}
                height={16}
                borderRadius={4}
                shimmerValue={shimmer}
              />
              <Skeleton
                width={48}
                height={10}
                borderRadius={4}
                shimmerValue={shimmer}
                style={{ marginTop: 4 }}
              />
            </View>
            <View
              style={{
                width: 1,
                height: 24,
                backgroundColor: "rgba(255,255,255,0.08)",
              }}
            />
            <View className="items-center px-4">
              <Skeleton
                width={36}
                height={16}
                borderRadius={4}
                shimmerValue={shimmer}
              />
              <Skeleton
                width={40}
                height={10}
                borderRadius={4}
                shimmerValue={shimmer}
                style={{ marginTop: 4 }}
              />
            </View>
            <View
              style={{
                width: 1,
                height: 24,
                backgroundColor: "rgba(255,255,255,0.08)",
              }}
            />
            <View className="items-center px-4">
              <Skeleton
                width={28}
                height={16}
                borderRadius={4}
                shimmerValue={shimmer}
              />
              <Skeleton
                width={32}
                height={10}
                borderRadius={4}
                shimmerValue={shimmer}
                style={{ marginTop: 4 }}
              />
            </View>
          </View>
        </View>

        {/* Battle button */}
        <View className="mx-6 mt-6">
          <Skeleton
            width="100%"
            height={76}
            borderRadius={16}
            shimmerValue={shimmer}
          />
        </View>

        {/* Secondary row */}
        <View
          style={{ flexDirection: "row", marginHorizontal: 24, marginTop: 12 }}
        >
          <View style={{ flex: 1, marginRight: 8 }}>
            <Skeleton
              width="100%"
              height={44}
              borderRadius={12}
              shimmerValue={shimmer}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Skeleton
              width="100%"
              height={44}
              borderRadius={12}
              shimmerValue={shimmer}
            />
          </View>
        </View>

        {/* League card */}
        <View className="mx-6 mt-3">
          <View className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
            <Skeleton
              width="100%"
              height={3}
              borderRadius={0}
              shimmerValue={shimmer}
            />
            <View className="px-4 pt-3 pb-4">
              <View className="flex-row items-center justify-between mb-3">
                <Skeleton
                  width={110}
                  height={14}
                  borderRadius={4}
                  shimmerValue={shimmer}
                />
                <Skeleton
                  width={50}
                  height={18}
                  borderRadius={10}
                  shimmerValue={shimmer}
                />
              </View>
              <View className="flex-row justify-around items-center">
                <View className="items-center">
                  <Skeleton
                    width={40}
                    height={28}
                    borderRadius={6}
                    shimmerValue={shimmer}
                  />
                  <Skeleton
                    width={52}
                    height={10}
                    borderRadius={4}
                    shimmerValue={shimmer}
                    style={{ marginTop: 6 }}
                  />
                </View>
                <View
                  style={{
                    width: 1,
                    height: 36,
                    backgroundColor: "rgba(255,255,255,0.08)",
                  }}
                />
                <View className="items-center">
                  <Skeleton
                    width={36}
                    height={28}
                    borderRadius={6}
                    shimmerValue={shimmer}
                  />
                  <Skeleton
                    width={40}
                    height={10}
                    borderRadius={4}
                    shimmerValue={shimmer}
                    style={{ marginTop: 6 }}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Recent matches card */}
        <View className="mx-6 mt-3">
          <View className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
            <View className="flex-row items-center justify-between px-4 pt-3 pb-2">
              <Skeleton
                width={50}
                height={14}
                borderRadius={4}
                shimmerValue={shimmer}
              />
              <Skeleton
                width={50}
                height={12}
                borderRadius={4}
                shimmerValue={shimmer}
              />
            </View>
            {/* W/L strip */}
            <View className="flex-row px-4 pb-3" style={{ gap: 4 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  width={20}
                  height={20}
                  borderRadius={4}
                  shimmerValue={shimmer}
                />
              ))}
            </View>
            {/* Match rows */}
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                className="flex-row items-center px-4 py-2.5"
                style={{
                  borderTopWidth: 1,
                  borderTopColor: "rgba(255,255,255,0.06)",
                }}
              >
                <Skeleton
                  width={3}
                  height={28}
                  borderRadius={2}
                  shimmerValue={shimmer}
                />
                <Skeleton
                  width={90 + i * 10}
                  height={14}
                  borderRadius={4}
                  shimmerValue={shimmer}
                  style={{ marginLeft: 10 }}
                />
                <View className="flex-1" />
                <Skeleton
                  width={30}
                  height={12}
                  borderRadius={4}
                  shimmerValue={shimmer}
                />
                <Skeleton
                  width={32}
                  height={14}
                  borderRadius={4}
                  shimmerValue={shimmer}
                  style={{ marginLeft: 12 }}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
