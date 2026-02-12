import { View, Pressable } from "react-native";
import { TextBold } from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import type { QuestionTypeProps } from "./types";

export function TrueFalseOptions({
  question,
  selectedAnswer,
  showResult,
  correctAnswer,
  onSubmit,
  disabled,
}: QuestionTypeProps) {
  const labels = question.options.length === 2 ? question.options : ["True", "False"];

  return (
    <View className="flex-row" style={{ gap: 12 }}>
      {labels.map((label, index) => {
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
            className={`flex-1 py-4 rounded-xl border ${bgClass} flex-row items-center justify-center`}
          >
            {showResult && isCorrect && (
              <Ionicons
                name="checkmark-circle"
                size={18}
                color="#10B981"
                style={{ marginRight: 6 }}
              />
            )}
            {isWrongSelected && (
              <Ionicons
                name="close-circle"
                size={18}
                color="#EF4444"
                style={{ marginRight: 6 }}
              />
            )}
            <TextBold
              className={`text-xl ${
                showResult && isCorrect
                  ? "text-win"
                  : isWrongSelected
                  ? "text-lose"
                  : "text-white"
              }`}
            >
              {label}
            </TextBold>
          </Pressable>
        );
      })}
    </View>
  );
}
