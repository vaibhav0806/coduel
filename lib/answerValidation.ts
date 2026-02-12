import type { QuestionType, Answer } from "@/types/database";

/**
 * Check if a player's answer is correct for a given question type.
 * Single source of truth for correctness checking.
 */
export function isAnswerCorrect(
  questionType: QuestionType,
  playerAnswer: Answer | null,
  correctAnswer: Answer
): boolean {
  // Timeout or no answer
  if (playerAnswer === null || playerAnswer === -1) return false;

  switch (questionType) {
    case "mcq":
    case "true_false":
    case "spot_the_bug":
      // Single integer comparison
      return playerAnswer === correctAnswer;

    case "multi_select":
      // Order doesn't matter — sort both arrays and compare
      if (!Array.isArray(playerAnswer) || !Array.isArray(correctAnswer))
        return false;
      if (playerAnswer.length !== correctAnswer.length) return false;
      const sortedPlayer = [...playerAnswer].sort((a, b) => a - b);
      const sortedCorrect = [...correctAnswer].sort((a, b) => a - b);
      return sortedPlayer.every((v, i) => v === sortedCorrect[i]);

    case "reorder":
    case "fill_blank":
      // Order matters — compare element by element
      if (!Array.isArray(playerAnswer) || !Array.isArray(correctAnswer))
        return false;
      if (playerAnswer.length !== correctAnswer.length) return false;
      return playerAnswer.every((v, i) => v === correctAnswer[i]);

    default:
      return playerAnswer === correctAnswer;
  }
}
