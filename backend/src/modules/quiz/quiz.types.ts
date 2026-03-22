export type QuizType = "translate" | "reverse";

export type Quiz = {
  type: QuizType;
  question: string;
  options: string[];
  correctAnswer: string;
};

export type QuizPublic = Omit<Quiz, "correctAnswer">;
