export type QuestionType = 'mcq' | 'true_false' | 'spot_the_bug' | 'multi_select' | 'reorder' | 'fill_blank';
export type Answer = number | number[];

/**
 * Check if a player's answer is correct for a given question type.
 * Single source of truth for correctness checking (edge function copy).
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
      return playerAnswer === correctAnswer;

    case "multi_select":
      if (!Array.isArray(playerAnswer) || !Array.isArray(correctAnswer))
        return false;
      if (playerAnswer.length !== correctAnswer.length) return false;
      const sortedPlayer = [...playerAnswer].sort((a: number, b: number) => a - b);
      const sortedCorrect = [...correctAnswer].sort((a: number, b: number) => a - b);
      return sortedPlayer.every((v: number, i: number) => v === sortedCorrect[i]);

    case "reorder":
    case "fill_blank":
      if (!Array.isArray(playerAnswer) || !Array.isArray(correctAnswer))
        return false;
      if (playerAnswer.length !== correctAnswer.length) return false;
      return playerAnswer.every((v: number, i: number) => v === correctAnswer[i]);

    default:
      return playerAnswer === correctAnswer;
  }
}
