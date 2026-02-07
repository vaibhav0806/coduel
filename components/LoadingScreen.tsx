import React, { useEffect } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { Text, TextBold } from "@/components/ui/Text";

interface LoadingScreenProps {
  onAnimationComplete?: () => void;
}

export function LoadingScreen({ onAnimationComplete }: LoadingScreenProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    // Pulsing animation
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
      ),
      -1, // Infinite repeat
      false
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.6, { duration: 600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View className="flex-1 bg-dark items-center justify-center">
      {/* Logo Container */}
      <Animated.View
        style={animatedStyle}
        className="items-center justify-center"
      >
        {/* Icon placeholder - replace with custom logo later */}
        <View className="w-24 h-24 bg-primary/20 rounded-3xl items-center justify-center mb-6 border border-primary/30">
          <Ionicons name="code-slash" size={48} color="#39FF14" />
        </View>
      </Animated.View>

      {/* App Name */}
      <TextBold className="text-white text-3xl tracking-wider">
        CODUEL
      </TextBold>
      <Text className="text-gray-500 text-sm mt-2">
        Code. Battle. Win.
      </Text>

      {/* Loading indicator dots */}
      <View className="flex-row mt-8">
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
