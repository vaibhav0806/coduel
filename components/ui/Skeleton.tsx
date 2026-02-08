import { View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  SharedValue,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

function useShimmer() {
  const translateX = useSharedValue(-1);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      false
    );
  }, []);

  return translateX;
}

export function useSkeletonAnimation() {
  // Each screen calling this gets its own shared value,
  // but all Skeleton children within that screen share it
  const translateX = useShimmer();
  return translateX;
}

interface SkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
  shimmerValue: SharedValue<number>;
}

export function Skeleton({
  width,
  height,
  borderRadius = 4,
  style,
  shimmerValue,
}: SkeletonProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerValue.value * 200 }],
  }));

  return (
    <View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: "#1A1A24",
          overflow: "hidden",
        },
        style,
      ]}
    >
      <AnimatedLinearGradient
        colors={[
          "transparent",
          "rgba(255,255,255,0.06)",
          "transparent",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          {
            position: "absolute",
            top: 0,
            bottom: 0,
            left: -100,
            right: -100,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}
