import { View, Pressable } from "react-native";
import { Text, TextBold } from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import type { QuestionTypeProps } from "./types";

export function FillBlankOptions({
  question,
  selectedAnswer,
  showResult,
  correctAnswer,
  onSubmit,
  disabled,
}: QuestionTypeProps) {
  // Parse blanks from code_snippet (marked with ___)
  // Fix literal \n from DB (standard SQL strings don't interpret escape sequences)
  const codeLines = question.code_snippet.replace(/\\n/g, "\n").replace(/\\t/g, "\t").split("\n");
  const blankPattern = /___/g;

  // Count total blanks
  let totalBlanks = 0;
  for (const line of codeLines) {
    const matches = line.match(blankPattern);
    if (matches) totalBlanks += matches.length;
  }

  const [fills, setFills] = useState<(number | null)[]>(
    Array(totalBlanks).fill(null)
  );
  const [activeBlank, setActiveBlank] = useState<number | null>(0);
  const submitted = selectedAnswer !== null;
  const correctArr = Array.isArray(correctAnswer) ? correctAnswer : [];
  const submittedArr = Array.isArray(selectedAnswer) ? selectedAnswer : [];

  const fillBlank = (tokenIdx: number) => {
    if (submitted || disabled || activeBlank === null) return;
    setFills((prev) => {
      const next = [...prev];
      next[activeBlank] = tokenIdx;
      return next;
    });
    // Move to next empty blank
    const nextEmpty = fills.findIndex(
      (f, i) => f === null && i !== activeBlank
    );
    setActiveBlank(nextEmpty >= 0 ? nextEmpty : null);
  };

  const clearBlank = (blankIdx: number) => {
    if (submitted || disabled) return;
    setFills((prev) => {
      const next = [...prev];
      next[blankIdx] = null;
      return next;
    });
    setActiveBlank(blankIdx);
  };

  const handleSubmit = () => {
    if (fills.some((f) => f === null)) return;
    onSubmit(fills as number[]);
  };

  const allFilled = fills.every((f) => f !== null);

  // Render code with blanks
  let blankCounter = 0;
  const renderCode = () => {
    let counter = 0;
    return codeLines.map((line, lineIdx) => {
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;
      const regex = /___/g;

      while ((match = regex.exec(line)) !== null) {
        // Text before blank
        if (match.index > lastIndex) {
          parts.push(
            <Text key={`${lineIdx}-t-${lastIndex}`} className="text-white font-mono text-sm">
              {line.slice(lastIndex, match.index)}
            </Text>
          );
        }

        const blankIdx = counter;
        counter++;
        const fillValue = submitted ? submittedArr[blankIdx] : fills[blankIdx];
        const isActive = !submitted && activeBlank === blankIdx;
        const isCorrectFill =
          showResult && submittedArr[blankIdx] === correctArr[blankIdx];
        const isWrongFill =
          showResult &&
          submittedArr[blankIdx] !== undefined &&
          submittedArr[blankIdx] !== correctArr[blankIdx];

        let blankBg = "bg-dark-border";
        if (showResult) {
          if (isCorrectFill) blankBg = "bg-win/30";
          else if (isWrongFill) blankBg = "bg-lose/30";
        } else if (isActive) {
          blankBg = "bg-primary/30";
        } else if (fillValue !== null && fillValue !== undefined) {
          blankBg = "bg-primary/10";
        }

        parts.push(
          <Pressable
            key={`${lineIdx}-b-${blankIdx}`}
            onPress={() => clearBlank(blankIdx)}
            disabled={submitted || disabled}
            className={`${blankBg} rounded px-2 py-0.5 mx-0.5 border ${
              isActive ? "border-primary" : "border-transparent"
            }`}
            style={{ minWidth: 60 }}
          >
            <Text
              className={`font-mono text-sm text-center ${
                fillValue !== null && fillValue !== undefined
                  ? showResult && isWrongFill
                    ? "text-lose"
                    : showResult && isCorrectFill
                    ? "text-win"
                    : "text-primary"
                  : "text-gray-600"
              }`}
            >
              {fillValue !== null && fillValue !== undefined
                ? question.options[fillValue]
                : "___"}
            </Text>
          </Pressable>
        );

        lastIndex = match.index + match[0].length;
      }

      // Remaining text after last blank
      if (lastIndex < line.length) {
        parts.push(
          <Text key={`${lineIdx}-t-${lastIndex}`} className="text-white font-mono text-sm">
            {line.slice(lastIndex)}
          </Text>
        );
      }

      return (
        <View
          key={lineIdx}
          className="flex-row flex-wrap items-center mb-1"
        >
          <Text className="text-gray-500 font-mono text-xs w-6 mr-2">
            {lineIdx + 1}
          </Text>
          {parts}
        </View>
      );
    });
  };

  // Used tokens
  const usedTokens = new Set(
    submitted ? submittedArr : fills.filter((f): f is number => f !== null)
  );

  return (
    <View>
      {/* Code with blanks */}
      <View className="bg-dark-card rounded-xl p-4 border border-dark-border mb-4">
        {renderCode()}
      </View>

      {/* Token chips */}
      {!submitted && (
        <View className="flex-row flex-wrap mb-4" style={{ gap: 8 }}>
          {question.options.map((token, idx) => {
            const isUsed = usedTokens.has(idx);
            return (
              <Pressable
                key={idx}
                onPress={() => fillBlank(idx)}
                disabled={disabled || isUsed}
                className={`rounded-lg px-4 py-2 border ${
                  isUsed
                    ? "bg-dark-card border-dark-border opacity-30"
                    : "bg-dark-card border-dark-border"
                }`}
              >
                <Text
                  className={`font-mono text-sm ${
                    isUsed ? "text-gray-600" : "text-white"
                  }`}
                >
                  {token}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Show correct fills on result */}
      {showResult && (
        <View className="bg-dark-card border border-secondary/30 rounded-xl p-3 mb-4">
          <Text className="text-secondary text-xs mb-2 font-bold">
            Correct fills:
          </Text>
          {correctArr.map((idx, i) => (
            <Text key={i} className="text-gray-300 font-mono text-sm mb-1">
              Blank {i + 1}: {question.options[idx]}
            </Text>
          ))}
        </View>
      )}

      {/* Submit button */}
      {!submitted && !disabled && (
        <Pressable
          onPress={handleSubmit}
          disabled={!allFilled}
          className={`p-4 rounded-xl items-center ${
            allFilled
              ? "bg-primary/20 border border-primary"
              : "bg-dark-card border border-dark-border opacity-50"
          }`}
        >
          <TextBold className={allFilled ? "text-primary" : "text-gray-500"}>
            Submit
          </TextBold>
        </Pressable>
      )}
    </View>
  );
}
