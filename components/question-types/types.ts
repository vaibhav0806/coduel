import type { QuestionType, Answer } from "@/types/database";

export interface BattleQuestion {
  id: string;
  question_type: QuestionType;
  code_snippet: string;
  question_text: string;
  options: string[];
  language?: string;
  correct_answer?: Answer;
  explanation?: string;
}

export interface QuestionTypeProps {
  question: BattleQuestion;
  selectedAnswer: Answer | null;
  showResult: boolean;
  correctAnswer: Answer | null;
  onSubmit: (answer: Answer) => void;
  disabled: boolean;
}
