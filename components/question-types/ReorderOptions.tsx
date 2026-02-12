import { View, Pressable } from "react-native";
import { Text, TextBold } from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import type { QuestionTypeProps } from "./types";

function shuffle(arr: number[]): number[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function ReorderOptions({
  question,
  selectedAnswer,
  showResult,
  correctAnswer,
  onSubmit,
  disabled,
}: QuestionTypeProps) {
  const totalSlots = question.options.length;
  const [slots, setSlots] = useState<(number | null)[]>(
    Array(totalSlots).fill(null)
  );
  const [availableChips, setAvailableChips] = useState<number[]>(() =>
    shuffle(question.options.map((_, i) => i))
  );
  const submitted = selectedAnswer !== null;
  const correctArr = Array.isArray(correctAnswer) ? correctAnswer : [];
  const submittedArr = Array.isArray(selectedAnswer) ? selectedAnswer : [];

  const placeChip = (chipIndex: number) => {
    if (submitted || disabled) return;
    const nextEmptySlot = slots.findIndex((s) => s === null);
    if (nextEmptySlot === -1) return;

    setSlots((prev) => {
      const next = [...prev];
      next[nextEmptySlot] = chipIndex;
      return next;
    });
    setAvailableChips((prev) => prev.filter((c) => c !== chipIndex));
  };

  const removeFromSlot = (slotIndex: number) => {
    if (submitted || disabled) return;
    const chipIndex = slots[slotIndex];
    if (chipIndex === null) return;

    setSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
    setAvailableChips((prev) => [...prev, chipIndex]);
  };

  const handleSubmit = () => {
    if (slots.some((s) => s === null)) return;
    onSubmit(slots as number[]);
  };

  const allFilled = slots.every((s) => s !== null);

  return (
    <View>
      {/* Slots */}
      <View className="mb-4">
        {slots.map((chipIdx, slotIdx) => {
          const isCorrect =
            showResult && submittedArr[slotIdx] === correctArr[slotIdx];
          const isWrong =
            showResult &&
            submittedArr[slotIdx] !== undefined &&
            submittedArr[slotIdx] !== correctArr[slotIdx];

          let bgClass = "bg-dark-card border-dark-border";
          if (showResult) {
            if (isCorrect) bgClass = "bg-win/20 border-win";
            else if (isWrong) bgClass = "bg-lose/20 border-lose";
          } else if (chipIdx !== null) {
            bgClass = "bg-primary/10 border-primary/50";
          }

          return (
            <Pressable
              key={slotIdx}
              onPress={() => removeFromSlot(slotIdx)}
              disabled={submitted || disabled || chipIdx === null}
              className={`p-3 rounded-xl border ${bgClass} mb-2`}
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-dark-border items-center justify-center mr-3">
                  <Text className="text-gray-400 font-bold text-sm">
                    {slotIdx + 1}
                  </Text>
                </View>
                {chipIdx !== null ? (
                  <Text className="text-white flex-1 font-mono text-sm">
                    {question.options[showResult ? submittedArr[slotIdx] : chipIdx]}
                  </Text>
                ) : (
                  <Text className="text-gray-600 flex-1 italic">
                    Tap a line below to place here
                  </Text>
                )}
                {showResult && isCorrect && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#10B981"
                  />
                )}
                {showResult && isWrong && (
                  <Ionicons name="close-circle" size={20} color="#EF4444" />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Available chips */}
      {!submitted && (
        <View className="flex-row flex-wrap" style={{ gap: 8 }}>
          {availableChips.map((chipIdx) => (
            <Pressable
              key={chipIdx}
              onPress={() => placeChip(chipIdx)}
              disabled={disabled}
              className="bg-dark-card border border-dark-border rounded-lg px-3 py-2"
            >
              <Text className="text-white font-mono text-sm">
                {question.options[chipIdx]}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Show correct order on result */}
      {showResult && (
        <View className="mt-3 bg-dark-card border border-secondary/30 rounded-xl p-3">
          <Text className="text-secondary text-xs mb-2 font-bold">
            Correct order:
          </Text>
          {correctArr.map((idx, i) => (
            <Text key={i} className="text-gray-300 font-mono text-sm mb-1">
              {i + 1}. {question.options[idx]}
            </Text>
          ))}
        </View>
      )}

      {/* Submit button */}
      {!submitted && !disabled && (
        <Pressable
          onPress={handleSubmit}
          disabled={!allFilled}
          className={`mt-4 p-4 rounded-xl items-center ${
            allFilled
              ? "bg-primary/20 border border-primary"
              : "bg-dark-card border border-dark-border opacity-50"
          }`}
        >
          <TextBold className={allFilled ? "text-primary" : "text-gray-500"}>
            Submit Order
          </TextBold>
        </Pressable>
      )}
    </View>
  );
}
