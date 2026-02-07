import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { TextBold } from "@/components/ui/Text";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  interpolate,
  runOnJS,
} from "react-native-reanimated";

interface AnimatedLogoProps {
  size?: "small" | "medium" | "large";
  animate?: boolean;
  onAnimationComplete?: () => void;
}

const sizeConfig = {
  small: { fontSize: 24, cursorSize: 20, spacing: 2 },
  medium: { fontSize: 36, cursorSize: 28, spacing: 3 },
  large: { fontSize: 48, cursorSize: 38, spacing: 4 },
};

export function AnimatedLogo({
  size = "large",
  animate = true,
  onAnimationComplete,
}: AnimatedLogoProps) {
  const config = sizeConfig[size];
  const [displayText, setDisplayText] = useState(animate ? "" : "oduel");

  // Animation values
  const cursorOpacity = useSharedValue(1);
  const cursorPosition = useSharedValue(0);
  const letterOpacity = useSharedValue(0);

  const text = "oduel";

  useEffect(() => {
    if (!animate) {
      setDisplayText(text);
      letterOpacity.value = 1;
      return;
    }

    // Blinking cursor animation
    cursorOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 400 }),
        withTiming(1, { duration: 400 })
      ),
      -1,
      false
    );

    // Type out letters one by one
    let currentIndex = 0;
    const typeInterval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayText(text.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        // Stop cursor blinking after typing is done
        setTimeout(() => {
          cursorOpacity.value = withTiming(0, { duration: 200 });
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        }, 800);
      }
    }, 150);

    return () => clearInterval(typeInterval);
  }, [animate]);

  const cursorAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cursorOpacity.value,
  }));

  return (
    <View className="flex-row items-center justify-center">
      {/* Opening bracket/cursor */}
      <View className="relative">
        <TextBold
          style={{ fontSize: config.fontSize, color: "#39FF14" }}
        >
          {"<"}
        </TextBold>
        {/* Blinking cursor line */}
        <Animated.View
          style={[
            cursorAnimatedStyle,
            {
              position: "absolute",
              right: -2,
              top: "15%",
              height: "70%",
              width: 3,
              backgroundColor: "#39FF14",
              borderRadius: 1,
            },
          ]}
        />
      </View>

      {/* Typed text */}
      <TextBold
        style={{
          fontSize: config.fontSize,
          color: "#FFFFFF",
          marginLeft: config.spacing,
        }}
      >
        {displayText}
      </TextBold>

      {/* Closing bracket - appears after text is done */}
      {displayText.length === text.length && (
        <TextBold
          style={{
            fontSize: config.fontSize,
            color: "#39FF14",
            marginLeft: config.spacing,
          }}
        >
          {"/>"}
        </TextBold>
      )}
    </View>
  );
}

// Static version for places where animation isn't needed
export function Logo({ size = "medium" }: { size?: "small" | "medium" | "large" }) {
  const config = sizeConfig[size];

  return (
    <View className="flex-row items-center">
      <TextBold style={{ fontSize: config.fontSize, color: "#39FF14" }}>
        {"<"}
      </TextBold>
      <TextBold style={{ fontSize: config.fontSize, color: "#FFFFFF", marginLeft: config.spacing }}>
        oduel
      </TextBold>
      <TextBold style={{ fontSize: config.fontSize, color: "#39FF14", marginLeft: config.spacing }}>
        {"/>"}
      </TextBold>
    </View>
  );
}
