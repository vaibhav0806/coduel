import { View, Pressable } from "react-native";
import { Text } from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import type { QuestionTypeProps } from "./types";

export function SpotBugOptions({
  question,
  selectedAnswer,
  showResult,
  correctAnswer,
  onSubmit,
  disabled,
}: QuestionTypeProps) {
  return (
    <View>
      {question.options.map((line, index) => {
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

        return (
          <Pressable
            key={index}
            onPress={() => onSubmit(index)}
            disabled={disabled}
            className={`p-3 rounded-lg border ${bgClass} mb-2`}
          >
            <View className="flex-row items-center">
              <View className="w-8 items-center">
                <Text className="text-gray-500 font-mono text-xs">
                  {index + 1}
                </Text>
              </View>
              <Text className="text-white flex-1 font-mono text-sm">
                {line}
              </Text>
              {showResult && isCorrect && (
                <Ionicons name="bug" size={18} color="#10B981" />
              )}
              {isWrongSelected && (
                <Ionicons name="close-circle" size={18} color="#EF4444" />
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
