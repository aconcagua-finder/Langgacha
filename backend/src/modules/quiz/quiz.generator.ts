import { prisma } from "../../db/prisma.js";

import type { Quiz, QuizType } from "./quiz.types.js";

type GenerateQuizParams = {
  word: string;
  translationRu: string;
  quizCorrect: string;
  quizOptions: string[];
  masteryProgress: number;
  isEvolved: boolean;
  evolutionData?: unknown | null;
  wordType?: string;
  rarity?: string;
  language?: string;
};

type DistractorWord = {
  word: string;
  type: string;
  rarity: string;
  language: string;
};

let cachedWords: DistractorWord[] | null = null;
let cachedWordsPromise: Promise<DistractorWord[]> | null = null;

const shuffle = <T>(items: T[]): T[] => {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
};

const pickQuizType = (masteryProgress: number): QuizType => {
  if (masteryProgress <= 0) return "translate";
  const roll = Math.random();
  if (masteryProgress === 1) {
    return roll < 0.7 ? "translate" : "reverse";
  }
  if (masteryProgress === 2) {
    if (roll < 0.3) return "translate";
    if (roll < 0.9) return "reverse";
    return "typing";
  }
  if (masteryProgress === 3) {
    if (roll < 0.2) return "translate";
    if (roll < 0.7) return "reverse";
    return "typing";
  }
  if (roll < 0.1) return "translate";
  if (roll < 0.5) return "reverse";
  return "typing";
};

const buildTranslateQuiz = (params: GenerateQuizParams): Quiz => ({
  type: "translate",
  question: `Как переводится «${params.word}»?`,
  options: shuffle(params.quizOptions),
  correctAnswer: params.quizCorrect,
});

const buildTypingQuiz = (params: GenerateQuizParams): Quiz => ({
  type: "typing",
  question: `Напишите по-испански: «${params.translationRu}»`,
  options: [],
  correctAnswer: params.word,
});

const getDistractorPool = async (): Promise<DistractorWord[]> => {
  if (cachedWords) return cachedWords;
  if (!cachedWordsPromise) {
    cachedWordsPromise = prisma.word.findMany({
      select: {
        word: true,
        type: true,
        rarity: true,
        language: true,
      },
    }).then((words) => {
      cachedWords = words;
      return words;
    }).finally(() => {
      cachedWordsPromise = null;
    });
  }
  return cachedWordsPromise;
};

const pickDistractors = async (
  correctWord: string,
  wordType?: string,
  rarity?: string,
  language?: string,
): Promise<string[]> => {
  const normalizedCorrect = correctWord.trim().toLowerCase();
  const pool = await getDistractorPool();
  const nonMatching = pool.filter((item) => item.word.trim().toLowerCase() !== normalizedCorrect);
  const sameLanguage = language
    ? nonMatching.filter((item) => item.language === language)
    : nonMatching;

  const buckets = [
    wordType ? sameLanguage.filter((item) => item.type === wordType) : [],
    rarity ? sameLanguage.filter((item) => item.rarity === rarity) : [],
    sameLanguage,
    nonMatching,
  ];

  const distractors: string[] = [];
  const seen = new Set<string>([normalizedCorrect]);

  for (const bucket of buckets) {
    for (const item of shuffle(bucket)) {
      const normalizedWord = item.word.trim().toLowerCase();
      if (!normalizedWord || seen.has(normalizedWord)) continue;
      seen.add(normalizedWord);
      distractors.push(item.word);
      if (distractors.length === 3) return distractors;
    }
  }

  return distractors;
};

const buildReverseQuiz = async (params: GenerateQuizParams): Promise<Quiz | null> => {
  const distractors = await pickDistractors(
    params.word,
    params.wordType,
    params.rarity,
    params.language,
  );

  if (distractors.length < 3) return null;

  return {
    type: "reverse",
    question: `Как будет «${params.translationRu}» по-испански?`,
    options: shuffle([params.word, ...distractors]),
    correctAnswer: params.word,
  };
};

export const generateQuiz = async (params: GenerateQuizParams): Promise<Quiz> => {
  const selectedType = pickQuizType(params.masteryProgress);
  if (selectedType === "typing") {
    return buildTypingQuiz(params);
  }
  if (selectedType === "reverse") {
    const reverseQuiz = await buildReverseQuiz(params);
    if (reverseQuiz) return reverseQuiz;
  }
  return buildTranslateQuiz(params);
};
