import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { TextBold } from "@/components/ui/Text";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";

interface AnimatedLogoProps {
  size?: "small" | "medium" | "large";
  animate?: boolean;
  onAnimationComplete?: () => void;
}

const sizeConfig = {
  small: { fontSize: 24, cursorWidth: 2 },
  medium: { fontSize: 36, cursorWidth: 2 },
  large: { fontSize: 48, cursorWidth: 3 },
};

export function AnimatedLogo({
  size = "large",
  animate = true,
  onAnimationComplete,
}: AnimatedLogoProps) {
  const config = sizeConfig[size];
  const [displayText, setDisplayText] = useState(animate ? "" : "oduel");
  const [showClosing, setShowClosing] = useState(!animate);

  // Animation values
  const cursorOpacity = useSharedValue(1);

  const text = "oduel";

  useEffect(() => {
    if (!animate) {
      setDisplayText(text);
      setShowClosing(true);
      cursorOpacity.value = 0;
      return;
    }

    // Blinking cursor animation - faster blink
    cursorOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 400 }),
        withTiming(1, { duration: 400 })
      ),
      -1,
      false
    );

    // Type out letters one by one - crisp and quick (80ms per letter)
    let currentIndex = 0;
    const typeInterval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayText(text.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        // Show closing bracket immediately after typing
        setShowClosing(true);
        cursorOpacity.value = withTiming(0, { duration: 150 });
        // Quick callback after bracket appears
        setTimeout(() => {
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        }, 300);
      }
    }, 80); // 80ms per letter = crisp typing

    return () => clearInterval(typeInterval);
  }, [animate]);

  const cursorAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cursorOpacity.value,
  }));

  return (
    <View className="flex-row items-center justify-center">
      {/* Opening bracket */}
      <TextBold style={{ fontSize: config.fontSize, color: "#39FF14" }}>
        {"<"}
      </TextBold>

      {/* Typed text */}
      <TextBold
        style={{
          fontSize: config.fontSize,
          color: "#FFFFFF",
        }}
      >
        {displayText}
      </TextBold>

      {/* Blinking cursor */}
      {!showClosing && (
        <Animated.View
          style={[
            cursorAnimatedStyle,
            {
              width: config.cursorWidth,
              height: config.fontSize * 0.8,
              backgroundColor: "#39FF14",
              marginLeft: 2,
              borderRadius: 1,
            },
          ]}
        />
      )}

      {/* Closing bracket - appears after text is done */}
      {showClosing && (
        <TextBold style={{ fontSize: config.fontSize, color: "#39FF14" }}>
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
      <TextBold style={{ fontSize: config.fontSize, color: "#FFFFFF" }}>
        oduel
      </TextBold>
      <TextBold style={{ fontSize: config.fontSize, color: "#39FF14" }}>
        {"/>"}
      </TextBold>
    </View>
  );
}
