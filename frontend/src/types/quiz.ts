export type QuizType = "translate" | "reverse";

export type QuizData = {
  type: QuizType;
  question: string;
  options: string[];
};
