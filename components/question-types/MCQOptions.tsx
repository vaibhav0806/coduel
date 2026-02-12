import { View, Pressable } from "react-native";
import { Text } from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import type { QuestionTypeProps } from "./types";

export function MCQOptions({
  question,
  selectedAnswer,
  showResult,
  correctAnswer,
  onSubmit,
  disabled,
  shakeStyle,
}: QuestionTypeProps & { shakeStyle?: any }) {
  return (
    <View className="space-y-3">
      {question.options.map((option, index) => {
        const isSelected = selectedAnswer === index;
        const isCorrect = correctAnswer !== null && index === correctAnswer;
        const isWrongSelected = showResult && isSelected && !isCorrect;

        let bgClass = "bg-dark-card border-dark-border";
        if (showResult) {
          if (isCorrect) {
            bgClass = "bg-win/20 border-win";
          } else if (isWrongSelected) {
            bgClass = "bg-lose/20 border-lose";
          }
        } else if (isSelected) {
          bgClass = "bg-primary/20 border-primary";
        }

        const optionContent = (
          <Pressable
            onPress={() => onSubmit(index)}
            disabled={disabled}
            className={`p-4 rounded-xl border ${bgClass} mb-3`}
          >
            <View className="flex-row items-center">
              <View
                className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                  showResult && isCorrect
                    ? "bg-win"
                    : isWrongSelected
                    ? "bg-lose"
                    : "bg-dark-border"
                }`}
              >
                <Text className="text-white font-bold">
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>
              <Text className="text-white flex-1 font-mono">{option}</Text>
              {showResult && isCorrect && (
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              )}
              {isWrongSelected && (
                <Ionicons name="close-circle" size={24} color="#EF4444" />
              )}
            </View>
          </Pressable>
        );

        return isWrongSelected && shakeStyle ? (
          <Animated.View key={index} style={shakeStyle}>
            {optionContent}
          </Animated.View>
        ) : (
          <View key={index}>{optionContent}</View>
        );
      })}
    </View>
  );
}
