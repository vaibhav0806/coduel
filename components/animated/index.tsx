import React from "react";
import { ViewProps, PressableProps, Pressable } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  FadeOutUp,
  SlideInRight,
  SlideInLeft,
  SlideOutRight,
  SlideOutLeft,
  ZoomIn,
  ZoomOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

// Re-export Reanimated's built-in layout animations for convenience
export {
  FadeIn,
  FadeOut,
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  FadeOutUp,
  SlideInRight,
  SlideInLeft,
  SlideOutRight,
  SlideOutLeft,
  ZoomIn,
  ZoomOut,
};

// Default animation durations
export const DURATION = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const;

// Animated View Wrapper Props
interface AnimatedViewProps extends ViewProps {
  delay?: number;
  duration?: number;
}

// FadeInView - Fades in on mount
export function FadeInView({
  children,
  delay = 0,
  duration = DURATION.normal,
  style,
  ...props
}: AnimatedViewProps & { children: React.ReactNode }) {
  return (
    <Animated.View
      entering={FadeIn.delay(delay).duration(duration)}
      style={style}
      {...props}
    >
      {children}
    </Animated.View>
  );
}

// SlideInView - Slides in from a direction
interface SlideInViewProps extends AnimatedViewProps {
  direction?: "left" | "right" | "up" | "down";
  children: React.ReactNode;
}

export function SlideInView({
  children,
  direction = "up",
  delay = 0,
  duration = DURATION.normal,
  style,
  ...props
}: SlideInViewProps) {
  const enteringAnimation = (() => {
    switch (direction) {
      case "left":
        return SlideInLeft;
      case "right":
        return SlideInRight;
      case "up":
        return FadeInUp;
      case "down":
        return FadeInDown;
      default:
        return FadeInUp;
    }
  })();

  return (
    <Animated.View
      entering={enteringAnimation.delay(delay).duration(duration)}
      style={style}
      {...props}
    >
      {children}
    </Animated.View>
  );
}

// ScaleInView - Scales in on mount
export function ScaleInView({
  children,
  delay = 0,
  duration = DURATION.normal,
  style,
  ...props
}: AnimatedViewProps & { children: React.ReactNode }) {
  return (
    <Animated.View
      entering={ZoomIn.delay(delay).duration(duration)}
      style={style}
      {...props}
    >
      {children}
    </Animated.View>
  );
}

// PressableScale - Pressable with scale animation on press
interface PressableScaleProps extends Omit<PressableProps, "style"> {
  children: React.ReactNode;
  style?: ViewProps["style"];
  scaleValue?: number;
}

export function PressableScale({
  children,
  style,
  scaleValue = 0.96,
  onPressIn,
  onPressOut,
  ...props
}: PressableScaleProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (e: any) => {
    scale.value = withSpring(scaleValue, { damping: 20, stiffness: 300 });
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 });
    onPressOut?.(e);
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} {...props}>
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
}

// StaggeredList item wrapper - for animating list items
interface StaggeredItemProps extends AnimatedViewProps {
  index: number;
  staggerDelay?: number;
  children: React.ReactNode;
}

export function StaggeredItem({
  children,
  index,
  staggerDelay = 50,
  duration = DURATION.normal,
  style,
  ...props
}: StaggeredItemProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * staggerDelay).duration(duration)}
      style={style}
      {...props}
    >
      {children}
    </Animated.View>
  );
}
