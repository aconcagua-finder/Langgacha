import { prisma } from "../../db/prisma.js";

import type { Quiz, QuizType } from "./quiz.types.js";

type GenerateQuizParams = {
  word: string;
  translationRu: string;
  quizCorrect: string;
  quizOptions: string[];
  wordLevel: number;
  isEvolved: boolean;
  evolutionData?: unknown | null;
  wordType?: string;
  rarity?: string;
  language?: string;
  /** All theme keys of the word (primary + additional). Enables theme-semantic distractors. */
  wordThemes?: string[];
};

type DistractorWord = {
  id: string;
  word: string;
  type: string;
  rarity: string;
  language: string;
  themes: string[]; // all theme keys (primary + additional)
};

let cachedWords: DistractorWord[] | null = null;
let cachedWordsPromise: Promise<DistractorWord[]> | null = null;

/**
 * Bust the distractor cache. Call this whenever words or theme links change
 * (e.g. after reseeding). For now the cache lives until process restart.
 */
export const clearDistractorCache = (): void => {
  cachedWords = null;
  cachedWordsPromise = null;
};

const shuffle = <T>(items: T[]): T[] => {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
};

const pickQuizType = (wordLevel: number): QuizType => {
  if (wordLevel <= 1) return "translate";
  const roll = Math.random();
  if (wordLevel <= 5) {
    return roll < 0.7 ? "translate" : "reverse";
  }
  if (wordLevel <= 10) {
    if (roll < 0.25) return "translate";
    if (roll < 0.85) return "reverse";
    return "typing";
  }
  if (wordLevel <= 20) {
    if (roll < 0.15) return "translate";
    if (roll < 0.6) return "reverse";
    return "typing";
  }
  if (roll < 0.1) return "translate";
  if (roll < 0.45) return "reverse";
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
    cachedWordsPromise = prisma.word
      .findMany({
        select: {
          id: true,
          word: true,
          type: true,
          rarity: true,
          language: true,
          wordThemes: { select: { themeKey: true } },
        },
      })
      .then((rows) => {
        const mapped: DistractorWord[] = rows.map((row) => ({
          id: row.id,
          word: row.word,
          type: row.type,
          rarity: row.rarity,
          language: row.language,
          themes: row.wordThemes.map((wt) => wt.themeKey),
        }));
        cachedWords = mapped;
        return mapped;
      })
      .finally(() => {
        cachedWordsPromise = null;
      });
  }
  return cachedWordsPromise;
};

type PickDistractorsOptions = {
  correctWord: string;
  wordType?: string;
  rarity?: string;
  language?: string;
  /** Primary or all theme keys of the correct word — used to prioritize semantic distractors. */
  wordThemes?: string[];
};

const pickDistractors = async (options: PickDistractorsOptions): Promise<string[]> => {
  const { correctWord, wordType, rarity, language, wordThemes } = options;
  const normalizedCorrect = correctWord.trim().toLowerCase();
  const pool = await getDistractorPool();
  const nonMatching = pool.filter((item) => item.word.trim().toLowerCase() !== normalizedCorrect);
  const sameLanguage = language
    ? nonMatching.filter((item) => item.language === language)
    : nonMatching;

  // Phase 2.18: prioritize theme-semantic distractors.
  const themeSet = new Set(wordThemes ?? []);
  const sameTheme = themeSet.size
    ? sameLanguage.filter((item) => item.themes.some((k) => themeSet.has(k)))
    : [];

  // Same theme AND same type (tightest — e.g. both Object in "kitchen")
  const sameThemeAndType = wordType
    ? sameTheme.filter((item) => item.type === wordType)
    : [];

  const buckets = [
    sameThemeAndType,
    sameTheme,
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
  const distractors = await pickDistractors({
    correctWord: params.word,
    wordType: params.wordType,
    rarity: params.rarity,
    language: params.language,
    wordThemes: params.wordThemes,
  });

  if (distractors.length < 3) return null;

  return {
    type: "reverse",
    question: `Как будет «${params.translationRu}» по-испански?`,
    options: shuffle([params.word, ...distractors]),
    correctAnswer: params.word,
  };
};

export const generateQuiz = async (params: GenerateQuizParams): Promise<Quiz> => {
  const selectedType = pickQuizType(params.wordLevel);
  if (selectedType === "typing") {
    return buildTypingQuiz(params);
  }
  if (selectedType === "reverse") {
    const reverseQuiz = await buildReverseQuiz(params);
    if (reverseQuiz) return reverseQuiz;
  }
  return buildTranslateQuiz(params);
};
