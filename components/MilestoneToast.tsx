import { useEffect, useRef, useState, useCallback } from "react";
import { Pressable, View } from "react-native";
import { TextBold, Text } from "@/components/ui/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
} from "react-native-reanimated";

export interface Milestone {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
}

interface MilestoneToastProps {
  milestone: Milestone;
  topInset: number;
  onDismiss: () => void;
}

function MilestoneToast({ milestone, topInset, onDismiss }: MilestoneToastProps) {
  const translateY = useSharedValue(-120);
  const dismissedRef = useRef(false);

  const dismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    translateY.value = withTiming(-120, { duration: 250 }, () => {
      runOnJS(onDismiss)();
    });
  }, [onDismiss]);

  useEffect(() => {
    // Haptic on entry
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Spring in
    translateY.value = withSpring(0, { damping: 14, stiffness: 150 });

    // Auto-dismiss after 3s
    const timer = setTimeout(dismiss, 3000);
    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: topInset + 8,
          left: 16,
          right: 16,
          zIndex: 90,
        },
        animatedStyle,
      ]}
    >
      <Pressable onPress={dismiss}>
        <View
          style={{
            backgroundColor: "#111118",
            borderWidth: 1,
            borderColor: "#1E1E2A",
            borderRadius: 14,
            flexDirection: "row",
            overflow: "hidden",
            // Colored shadow glow
            shadowColor: milestone.color,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          {/* Left color accent bar */}
          <View
            style={{
              width: 4,
              backgroundColor: milestone.color,
              borderTopLeftRadius: 14,
              borderBottomLeftRadius: 14,
            }}
          />

          {/* Content */}
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 14,
              paddingHorizontal: 14,
            }}
          >
            {/* Emoji icon */}
            <Text style={{ fontSize: 28, marginRight: 12 }}>
              {milestone.icon}
            </Text>

            {/* Text column */}
            <View style={{ flex: 1 }}>
              <TextBold style={{ fontSize: 16, color: "#FFFFFF" }}>
                {milestone.title}
              </TextBold>
              <Text style={{ fontSize: 13, color: "#9CA3AF", marginTop: 2 }}>
                {milestone.subtitle}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

interface MilestoneToastQueueProps {
  milestones: Milestone[];
  onComplete: () => void;
}

export function MilestoneToastQueue({ milestones, onComplete }: MilestoneToastQueueProps) {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset index when new milestones arrive
  useEffect(() => {
    if (milestones.length > 0) {
      setCurrentIndex(0);
    }
  }, [milestones]);

  const handleDismiss = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next >= milestones.length) {
        // Small delay so the exit animation finishes before clearing
        setTimeout(onComplete, 50);
        return prev;
      }
      return next;
    });
  }, [milestones.length, onComplete]);

  if (milestones.length === 0 || currentIndex >= milestones.length) return null;

  return (
    <MilestoneToast
      key={milestones[currentIndex].id}
      milestone={milestones[currentIndex]}
      topInset={insets.top}
      onDismiss={handleDismiss}
    />
  );
}
