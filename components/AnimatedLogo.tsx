import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { TextBold } from "@/components/ui/Text";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from "react-native-reanimated";

interface AnimatedLogoProps {
  size?: "small" | "medium" | "large";
  animate?: boolean;
  onAnimationComplete?: () => void;
}

const sizeConfig = {
  small: { fontSize: 24, cursorWidth: 2, cursorHeight: 20 },
  medium: { fontSize: 36, cursorWidth: 2, cursorHeight: 30 },
  large: { fontSize: 48, cursorWidth: 3, cursorHeight: 40 },
};

export function AnimatedLogo({
  size = "large",
  animate = true,
  onAnimationComplete,
}: AnimatedLogoProps) {
  const config = sizeConfig[size];
  const fullText = "git gud";
  const [displayText, setDisplayText] = useState(animate ? "" : fullText);
  const [typingDone, setTypingDone] = useState(!animate);

  const cursorOpacity = useSharedValue(1);

  useEffect(() => {
    if (!animate) {
      setDisplayText(fullText);
      setTypingDone(true);
      cursorOpacity.value = 0;
      return;
    }

    // Blinking cursor
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
      if (currentIndex < fullText.length) {
        setDisplayText(fullText.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        setTypingDone(true);
        // Keep cursor blinking after typing
        setTimeout(() => {
          cursorOpacity.value = withTiming(0, { duration: 150 });
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        }, 400);
      }
    }, 90);

    return () => clearInterval(typeInterval);
  }, [animate]);

  const cursorAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cursorOpacity.value,
  }));

  // Split displayText to color "git" and "gud" differently
  const gitPart = displayText.substring(0, Math.min(3, displayText.length));
  const restPart = displayText.substring(3);

  return (
    <View className="flex-row items-center justify-center">
      {/* Terminal prompt */}
      <TextBold style={{ fontSize: config.fontSize, color: "#39FF14" }}>
        {"$ "}
      </TextBold>

      {/* "git" part - white */}
      <TextBold style={{ fontSize: config.fontSize, color: "#FFFFFF" }}>
        {gitPart}
      </TextBold>

      {/* " gud" part - neon green */}
      <TextBold style={{ fontSize: config.fontSize, color: "#39FF14" }}>
        {restPart}
      </TextBold>

      {/* Blinking cursor */}
      {!typingDone && (
        <Animated.View
          style={[
            cursorAnimatedStyle,
            {
              width: config.cursorWidth,
              height: config.cursorHeight,
              backgroundColor: "#39FF14",
              marginLeft: 2,
              borderRadius: 1,
            },
          ]}
        />
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
        {"$ "}
      </TextBold>
      <TextBold style={{ fontSize: config.fontSize, color: "#FFFFFF" }}>
        git
      </TextBold>
      <TextBold style={{ fontSize: config.fontSize, color: "#39FF14" }}>
        {" gud"}
      </TextBold>
    </View>
  );
}
