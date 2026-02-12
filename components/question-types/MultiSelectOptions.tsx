import { View, Pressable } from "react-native";
import { Text, TextBold } from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import type { QuestionTypeProps } from "./types";

export function MultiSelectOptions({
  question,
  selectedAnswer,
  showResult,
  correctAnswer,
  onSubmit,
  disabled,
}: QuestionTypeProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const submitted = selectedAnswer !== null;
  const correctSet = new Set(
    Array.isArray(correctAnswer) ? correctAnswer : []
  );
  const selectedSet = new Set(
    Array.isArray(selectedAnswer) ? selectedAnswer : []
  );

  const toggleOption = (index: number) => {
    if (submitted || disabled) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    if (selected.size === 0) return;
    onSubmit([...selected].sort((a, b) => a - b));
  };

  return (
    <View>
      {question.options.map((option, index) => {
        const isChecked = submitted ? selectedSet.has(index) : selected.has(index);
        const isCorrect = showResult && correctSet.has(index);
        const isWrongSelected = showResult && isChecked && !correctSet.has(index);
        const isMissed = showResult && correctSet.has(index) && !isChecked;

        let bgClass = "bg-dark-card border-dark-border";
        if (showResult) {
          if (isCorrect && isChecked) {
            bgClass = "bg-win/20 border-win";
          } else if (isWrongSelected) {
            bgClass = "bg-lose/20 border-lose";
          } else if (isMissed) {
            bgClass = "bg-win/10 border-win/50";
          }
        } else if (isChecked) {
          bgClass = "bg-primary/20 border-primary";
        }

        return (
          <Pressable
            key={index}
            onPress={() => toggleOption(index)}
            disabled={submitted || disabled}
            className={`p-4 rounded-xl border ${bgClass} mb-3`}
          >
            <View className="flex-row items-center">
              <View
                className={`w-7 h-7 rounded-md items-center justify-center mr-3 border ${
                  isChecked
                    ? showResult && isWrongSelected
                      ? "bg-lose border-lose"
                      : showResult && isCorrect
                      ? "bg-win border-win"
                      : "bg-primary border-primary"
                    : "bg-dark-border border-dark-border"
                }`}
              >
                {isChecked && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
              </View>
              <Text className="text-white flex-1 font-mono">{option}</Text>
              {showResult && isCorrect && isChecked && (
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              )}
              {isWrongSelected && (
                <Ionicons name="close-circle" size={20} color="#EF4444" />
              )}
              {isMissed && (
                <Ionicons name="arrow-back-circle" size={20} color="#10B981" />
              )}
            </View>
          </Pressable>
        );
      })}

      {/* Submit button */}
      {!submitted && !disabled && (
        <Pressable
          onPress={handleSubmit}
          disabled={selected.size === 0}
          className={`mt-2 p-4 rounded-xl items-center ${
            selected.size > 0
              ? "bg-primary/20 border border-primary"
              : "bg-dark-card border border-dark-border opacity-50"
          }`}
        >
          <TextBold
            className={selected.size > 0 ? "text-primary" : "text-gray-500"}
          >
            Submit ({selected.size} selected)
          </TextBold>
        </Pressable>
      )}
    </View>
  );
}
