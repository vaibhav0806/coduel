import { useEffect } from "react";
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  SharedValue,
  AnimatedStyle,
} from "react-native-reanimated";

// Timing configurations
export const TIMING = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const;

export const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 1,
} as const;

// Fade in animation hook
export function useFadeIn(
  duration: number = TIMING.normal,
  delay: number = 0
): { opacity: SharedValue<number>; animatedStyle: AnimatedStyle } {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration, easing: Easing.out(Easing.ease) })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return { opacity, animatedStyle };
}

// Slide in animation hook
export function useSlideIn(
  direction: "left" | "right" | "up" | "down" = "up",
  distance: number = 20,
  duration: number = TIMING.normal,
  delay: number = 0
): { animatedStyle: AnimatedStyle } {
  const translateX = useSharedValue(
    direction === "left" ? -distance : direction === "right" ? distance : 0
  );
  const translateY = useSharedValue(
    direction === "up" ? distance : direction === "down" ? -distance : 0
  );
  const opacity = useSharedValue(0);

  useEffect(() => {
    const timing = { duration, easing: Easing.out(Easing.ease) };
    translateX.value = withDelay(delay, withTiming(0, timing));
    translateY.value = withDelay(delay, withTiming(0, timing));
    opacity.value = withDelay(delay, withTiming(1, timing));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return { animatedStyle };
}

// Scale animation hook
export function useScale(
  from: number = 0.9,
  to: number = 1,
  duration: number = TIMING.normal,
  delay: number = 0
): { scale: SharedValue<number>; animatedStyle: AnimatedStyle } {
  const scale = useSharedValue(from);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(to, SPRING_CONFIG));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { scale, animatedStyle };
}

// Press animation hook for buttons
export function usePressAnimation(): {
  scale: SharedValue<number>;
  animatedStyle: AnimatedStyle;
  onPressIn: () => void;
  onPressOut: () => void;
} {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.96, { damping: 20, stiffness: 300 });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 });
  };

  return { scale, animatedStyle, onPressIn, onPressOut };
}

// Combined fade + slide animation
export function useFadeSlideIn(
  direction: "up" | "down" = "up",
  distance: number = 15,
  duration: number = TIMING.normal,
  delay: number = 0
): { animatedStyle: AnimatedStyle } {
  const translateY = useSharedValue(direction === "up" ? distance : -distance);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const timing = { duration, easing: Easing.out(Easing.cubic) };
    translateY.value = withDelay(delay, withTiming(0, timing));
    opacity.value = withDelay(delay, withTiming(1, timing));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return { animatedStyle };
}

// Staggered list item animation
export function useStaggeredItem(
  index: number,
  staggerDelay: number = 50
): { animatedStyle: AnimatedStyle } {
  return useFadeSlideIn("up", 15, TIMING.normal, index * staggerDelay);
}

// Pulse animation (for loading states)
export function usePulse(
  minOpacity: number = 0.4,
  maxOpacity: number = 1,
  duration: number = 1000
): { animatedStyle: AnimatedStyle } {
  const opacity = useSharedValue(maxOpacity);

  useEffect(() => {
    const animate = () => {
      opacity.value = withTiming(minOpacity, { duration: duration / 2 }, () => {
        opacity.value = withTiming(maxOpacity, { duration: duration / 2 });
      });
    };

    animate();
    const interval = setInterval(animate, duration);
    return () => clearInterval(interval);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return { animatedStyle };
}
