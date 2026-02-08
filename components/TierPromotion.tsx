import { View, Pressable, Dimensions } from "react-native";
import { TextBold, TextSemibold, Text } from "@/components/ui/Text";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  FadeIn,
  FadeInUp,
  runOnJS,
} from "react-native-reanimated";
import { useEffect } from "react";
import { getTierConfig } from "@/lib/rating";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const TIER_LABELS: Record<string, string> = {
  silver: "Silver",
  gold: "Gold",
  diamond: "Diamond",
};

const TIER_ICONS: Record<string, string> = {
  silver: "S",
  gold: "G",
  diamond: "D",
};

interface TierPromotionProps {
  tier: "silver" | "gold" | "diamond";
  onDismiss: () => void;
}

// Particle component for sparkle effects
function Particle({
  delay,
  startX,
  startY,
  color,
}: {
  delay: number;
  startX: number;
  startY: number;
  color: string;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 60 + Math.random() * 100;
    const targetX = Math.cos(angle) * distance;
    const targetY = Math.sin(angle) * distance;

    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(600, withTiming(0, { duration: 400 }))
      )
    );
    scale.value = withDelay(
      delay,
      withSequence(
        withSpring(1, { damping: 8, stiffness: 200 }),
        withDelay(400, withTiming(0, { duration: 300 }))
      )
    );
    translateX.value = withDelay(
      delay,
      withTiming(targetX, { duration: 1000, easing: Easing.out(Easing.cubic) })
    );
    translateY.value = withDelay(
      delay,
      withTiming(targetY, { duration: 1000, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: startX,
          top: startY,
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
}

export function TierPromotion({ tier, onDismiss }: TierPromotionProps) {
  const tierConfig = getTierConfig(
    tier === "diamond" ? 2000 : tier === "gold" ? 1500 : 1000
  );
  const colors = tierConfig.colors;

  // Badge animations
  const badgeScale = useSharedValue(0);
  const badgeRotate = useSharedValue(0);
  const ringScale = useSharedValue(0);
  const ringOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    // Fade in backdrop
    overlayOpacity.value = withTiming(1, { duration: 300 });

    // Expanding ring burst
    ringScale.value = withDelay(
      200,
      withTiming(3, { duration: 800, easing: Easing.out(Easing.cubic) })
    );
    ringOpacity.value = withDelay(
      200,
      withSequence(
        withTiming(0.6, { duration: 100 }),
        withTiming(0, { duration: 700 })
      )
    );

    // Badge zoom in with spring
    badgeScale.value = withDelay(
      300,
      withSpring(1, { damping: 8, stiffness: 120, mass: 0.8 })
    );

    // Subtle rotate on entry
    badgeRotate.value = withDelay(
      300,
      withSequence(
        withTiming(-5, { duration: 150 }),
        withSpring(0, { damping: 10, stiffness: 150 })
      )
    );

    // Pulsing glow
    glowOpacity.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(0.4, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.15, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, []);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: badgeScale.value },
      { rotate: `${badgeRotate.value}deg` },
    ],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  // Generate particles around center
  const centerX = SCREEN_WIDTH / 2;
  const centerY = SCREEN_HEIGHT / 2 - 40;
  const particles = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    delay: 400 + Math.random() * 400,
    startX: centerX - 3,
    startY: centerY - 3,
    color: i % 2 === 0 ? colors[0] : colors[1],
  }));

  const handleDismiss = () => {
    overlayOpacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(onDismiss)();
    });
  };

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
        },
        overlayStyle,
      ]}
    >
      <Pressable
        onPress={handleDismiss}
        style={{ flex: 1 }}
      >
        {/* Dark backdrop */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(5, 5, 8, 0.92)",
          }}
        />

        {/* Particles */}
        {particles.map((p) => (
          <Particle
            key={p.id}
            delay={p.delay}
            startX={p.startX}
            startY={p.startY}
            color={p.color}
          />
        ))}

        {/* Expanding ring */}
        <Animated.View
          style={[
            {
              position: "absolute",
              left: centerX - 60,
              top: centerY - 60,
              width: 120,
              height: 120,
              borderRadius: 60,
              borderWidth: 2,
              borderColor: colors[0],
            },
            ringStyle,
          ]}
        />

        {/* Center content */}
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Glow behind badge */}
          <Animated.View
            style={[
              {
                position: "absolute",
                width: 200,
                height: 200,
                borderRadius: 100,
              },
              glowStyle,
            ]}
          >
            <LinearGradient
              colors={[colors[0] + "60", "transparent"]}
              style={{
                width: 200,
                height: 200,
                borderRadius: 100,
              }}
              start={{ x: 0.5, y: 0.5 }}
              end={{ x: 0, y: 0 }}
            />
          </Animated.View>

          {/* Badge */}
          <Animated.View style={badgeStyle}>
            <LinearGradient
              colors={colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                padding: 4,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: 112,
                  height: 112,
                  borderRadius: 56,
                  backgroundColor: "#0A0A0F",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LinearGradient
                  colors={colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 48,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TextBold style={{ fontSize: 44, color: "#050508" }}>
                    {TIER_ICONS[tier]}
                  </TextBold>
                </LinearGradient>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Promoted text */}
          <Animated.View
            entering={FadeInUp.delay(600).duration(400)}
            style={{ alignItems: "center", marginTop: 28 }}
          >
            <Text
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.5)",
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              PROMOTED TO
            </Text>
            <TextBold
              style={{
                fontSize: 36,
                color: colors[0],
                marginTop: 4,
              }}
            >
              {TIER_LABELS[tier]}
            </TextBold>
          </Animated.View>

          {/* Tap to continue */}
          <Animated.View
            entering={FadeIn.delay(1200).duration(400)}
            style={{ marginTop: 48 }}
          >
            <Text
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.3)",
              }}
            >
              Tap to continue
            </Text>
          </Animated.View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
