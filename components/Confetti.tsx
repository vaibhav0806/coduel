import { Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { useEffect, useMemo } from "react";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const COLORS = [
  "#39FF14", // primary green
  "#10B981", // win green
  "#FFD700", // gold
  "#FF6B35", // orange
  "#4169E1", // blue
  "#B9F2FF", // diamond
  "#C0C0C0", // silver
  "#FF69B4", // pink
];

interface ConfettiPieceProps {
  index: number;
  total: number;
}

function ConfettiPiece({ index, total }: ConfettiPieceProps) {
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const config = useMemo(() => {
    const startX = Math.random() * SCREEN_WIDTH;
    const drift = (Math.random() - 0.5) * 120;
    const delay = Math.random() * 600;
    const duration = 2000 + Math.random() * 1500;
    const rotateEnd = (Math.random() - 0.5) * 720;
    const color = COLORS[index % COLORS.length];
    const size = 6 + Math.random() * 6;
    const isRect = Math.random() > 0.5;
    const aspectRatio = isRect ? 0.5 + Math.random() * 0.5 : 1;

    return { startX, drift, delay, duration, rotateEnd, color, size, aspectRatio, isRect };
  }, [index]);

  useEffect(() => {
    translateY.value = withDelay(
      config.delay,
      withTiming(SCREEN_HEIGHT + 40, {
        duration: config.duration,
        easing: Easing.in(Easing.quad),
      })
    );
    translateX.value = withDelay(
      config.delay,
      withTiming(config.drift, {
        duration: config.duration,
        easing: Easing.inOut(Easing.sin),
      })
    );
    rotate.value = withDelay(
      config.delay,
      withTiming(config.rotateEnd, {
        duration: config.duration,
        easing: Easing.linear,
      })
    );
    opacity.value = withDelay(
      config.delay + config.duration * 0.7,
      withTiming(0, { duration: config.duration * 0.3 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: config.startX,
          top: -20,
          width: config.size,
          height: config.size * config.aspectRatio,
          borderRadius: config.isRect ? 1 : config.size / 2,
          backgroundColor: config.color,
        },
        animatedStyle,
      ]}
    />
  );
}

interface ConfettiProps {
  count?: number;
}

export function Confetti({ count = 40 }: ConfettiProps) {
  const pieces = useMemo(
    () => Array.from({ length: count }, (_, i) => i),
    [count]
  );

  return (
    <>
      {pieces.map((i) => (
        <ConfettiPiece key={i} index={i} total={count} />
      ))}
    </>
  );
}
