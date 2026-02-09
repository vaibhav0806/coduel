import { useEffect, useRef } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const SPRING_CONFIG = { damping: 8, stiffness: 200, mass: 0.6 };

interface ScoreDotsProps {
  score: number;
  totalRounds: number;
  color: "bg-win" | "bg-lose";
}

export function ScoreDots({ score, totalRounds, color }: ScoreDotsProps) {
  const prevScore = useRef(0);

  // Always declare 5 shared values (totalRounds is always 5)
  const s0 = useSharedValue(1);
  const s1 = useSharedValue(1);
  const s2 = useSharedValue(1);
  const s3 = useSharedValue(1);
  const s4 = useSharedValue(1);
  const scales = [s0, s1, s2, s3, s4];

  const a0 = useAnimatedStyle(() => ({ transform: [{ scale: s0.value }] }));
  const a1 = useAnimatedStyle(() => ({ transform: [{ scale: s1.value }] }));
  const a2 = useAnimatedStyle(() => ({ transform: [{ scale: s2.value }] }));
  const a3 = useAnimatedStyle(() => ({ transform: [{ scale: s3.value }] }));
  const a4 = useAnimatedStyle(() => ({ transform: [{ scale: s4.value }] }));
  const animStyles = [a0, a1, a2, a3, a4];

  useEffect(() => {
    if (score > prevScore.current) {
      const dotIndex = score - 1;
      if (dotIndex >= 0 && dotIndex < 5) {
        scales[dotIndex].value = 0;
        scales[dotIndex].value = withSpring(1, SPRING_CONFIG);
      }
    }
    prevScore.current = score;
  }, [score]);

  return (
    <View className="flex-row mt-1">
      {Array.from({ length: totalRounds }).map((_, i) => (
        <Animated.View
          key={i}
          style={animStyles[i]}
          className={`w-3 h-3 rounded-full mx-1 ${
            i < score ? color : "bg-dark-border"
          }`}
        />
      ))}
    </View>
  );
}
