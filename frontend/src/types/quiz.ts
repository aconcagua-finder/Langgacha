export type QuizType = "translate" | "reverse" | "typing";

export type QuizData = {
  type: QuizType;
  question: string;
  options: string[];
};
