import React from "react";
import { View, Text, Pressable, ViewProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "outlined" | "ghost";
}

export function Card({
  children,
  variant = "default",
  className = "",
  ...props
}: CardProps) {
  const baseClass = "rounded-2xl p-4";
  const variantClasses = {
    default: "bg-dark-card border border-dark-border",
    elevated: "bg-dark-elevated border border-dark-border shadow-lg",
    outlined: "bg-transparent border border-dark-border",
    ghost: "bg-transparent",
  };

  return (
    <View className={`${baseClass} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </View>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export function StatCard({
  label,
  value,
  icon,
  iconColor = "#39FF14",
  trend,
  trendValue,
}: StatCardProps) {
  return (
    <View className="bg-dark-card border border-dark-border rounded-xl p-3">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-gray-400 text-xs uppercase tracking-wide">{label}</Text>
        {icon && <Ionicons name={icon} size={16} color={iconColor} />}
      </View>
      <View className="flex-row items-end">
        <Text className="text-white text-2xl font-bold">{value}</Text>
        {trend && trendValue && (
          <View className="flex-row items-center ml-2 mb-1">
            <Ionicons
              name={trend === "up" ? "arrow-up" : trend === "down" ? "arrow-down" : "remove"}
              size={12}
              color={trend === "up" ? "#10B981" : trend === "down" ? "#EF4444" : "#6B7280"}
            />
            <Text
              className={`text-xs ml-0.5 ${
                trend === "up" ? "text-win" : trend === "down" ? "text-lose" : "text-gray-500"
              }`}
            >
              {trendValue}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

interface ActionCardProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
}

export function ActionCard({
  title,
  subtitle,
  icon,
  iconColor,
  onPress,
  disabled = false,
  variant = "secondary",
}: ActionCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.98, { damping: 20, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 });
  };

  const variantClasses = {
    primary: "bg-primary/10 border-primary",
    secondary: "bg-dark-card border-dark-border",
    ghost: "bg-transparent border-dark-border",
  };

  const titleColor = variant === "primary" ? "text-primary" : "text-white";

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View
        style={animatedStyle}
        className={`rounded-xl p-4 border flex-row items-center ${variantClasses[variant]} ${
          disabled ? "opacity-50" : ""
        }`}
      >
        {icon && (
          <View className="w-10 h-10 rounded-full bg-dark-border/50 items-center justify-center mr-3">
            <Ionicons
              name={icon}
              size={20}
              color={iconColor ?? (variant === "primary" ? "#39FF14" : "#6B7280")}
            />
          </View>
        )}
        <View className="flex-1">
          <Text className={`font-semibold ${titleColor}`}>{title}</Text>
          {subtitle && <Text className="text-gray-500 text-sm mt-0.5">{subtitle}</Text>}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6B7280" />
      </Animated.View>
    </Pressable>
  );
}

interface CompactStatProps {
  label: string;
  value: string | number;
  color?: string;
}

export function CompactStat({ label, value, color = "#FFFFFF" }: CompactStatProps) {
  return (
    <View className="items-center">
      <Text className="text-2xl font-bold" style={{ color }}>
        {value}
      </Text>
      <Text className="text-gray-500 text-xs uppercase tracking-wide">{label}</Text>
    </View>
  );
}

interface StatRowProps {
  stats: { label: string; value: string | number; color?: string }[];
}

export function StatRow({ stats }: StatRowProps) {
  return (
    <View className="flex-row justify-around py-3 bg-dark-card border border-dark-border rounded-xl">
      {stats.map((stat, index) => (
        <React.Fragment key={stat.label}>
          <CompactStat {...stat} />
          {index < stats.length - 1 && <View className="w-px bg-dark-border" />}
        </React.Fragment>
      ))}
    </View>
  );
}
