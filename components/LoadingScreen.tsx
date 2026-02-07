import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
} from "react-native-reanimated";
import { Text } from "@/components/ui/Text";
import { AnimatedLogo } from "@/components/AnimatedLogo";

interface LoadingScreenProps {
  onAnimationComplete?: () => void;
}

export function LoadingScreen({ onAnimationComplete }: LoadingScreenProps) {
  return (
    <View className="flex-1 bg-dark items-center justify-center">
      {/* Animated Logo */}
      <AnimatedLogo size="large" animate={true} />

      {/* Tagline */}
      <Animated.View entering={FadeIn.delay(1200).duration(400)}>
        <Text className="text-gray-500 text-sm mt-4">
          Code. Battle. Win.
        </Text>
      </Animated.View>

      {/* Loading indicator dots */}
      <View className="flex-row mt-10">
        <LoadingDot delay={0} />
        <LoadingDot delay={150} />
        <LoadingDot delay={300} />
      </View>
    </View>
  );
}

function LoadingDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    const timeout = setTimeout(() => {
      opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 })
        ),
        -1,
        false
      );
    }, delay);

    return () => clearTimeout(timeout);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className="w-2 h-2 bg-primary rounded-full mx-1"
    />
  );
}
