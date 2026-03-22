import type { QuizType } from "./quiz.types.js";

export const normalizeAnswer = (value: string): string => value.trim().toLowerCase();

export const normalizeForComparison = (value: string): string =>
  normalizeAnswer(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export const isQuizAnswerCorrect = (
  type: QuizType,
  answer: string,
  correctAnswer: string,
): boolean => {
  if (type === "typing") {
    return normalizeForComparison(answer) === normalizeForComparison(correctAnswer);
  }

  return normalizeAnswer(answer) === normalizeAnswer(correctAnswer);
};
