import { prisma } from "../../db/prisma.js";
import {
  WORD_XP_BASE,
  WORD_XP_OVERDUE_BONUS,
  WORD_XP_REVERSE_BONUS,
  WORD_XP_TYPING_BONUS,
  WORD_XP_VARIANCE,
} from "../../shared/constants.js";
import {
  applyDecayIfNeededToRecord,
  type WordProgressDecayRecord,
} from "./word-progress.decay.js";
import { calculateLevelFromXp, clampWordXp } from "./word-progress.utils.js";

type WordProgressDb = Pick<typeof prisma, "wordProgress">;

export type WordProgressState = WordProgressDecayRecord & {
  xpInCurrentLevel: number;
  xpForNextLevel: number;
};

export type AwardWordXpOptions = {
  quizType: "translate" | "reverse" | "typing";
  wasOverdue: boolean;
};

export type WordXpAwardResult = {
  xpGained: number;
  newLevel: number;
  oldLevel: number;
  leveledUp: boolean;
  xpInCurrentLevel: number;
  xpForNextLevel: number;
};

const toWordProgressState = (progress: WordProgressDecayRecord): WordProgressState => {
  const derived = calculateLevelFromXp(progress.xp);

  return {
    ...progress,
    level: derived.level,
    xpInCurrentLevel: derived.xpInCurrentLevel,
    xpForNextLevel: derived.xpForNextLevel,
  };
};

const hydrateProgress = async (
  progress: WordProgressDecayRecord,
  db: WordProgressDb,
  now: Date,
): Promise<WordProgressState> => {
  const decayed = await applyDecayIfNeededToRecord(progress, db, now);
  return toWordProgressState(decayed);
};

const randomXpVariance = (): number =>
  Math.floor(Math.random() * (WORD_XP_VARIANCE * 2 + 1)) - WORD_XP_VARIANCE;

export const calculateWordXpGain = (options: AwardWordXpOptions): number => {
  let gainedXp = WORD_XP_BASE;

  if (options.quizType === "typing") {
    gainedXp += WORD_XP_TYPING_BONUS;
  } else if (options.quizType === "reverse") {
    gainedXp += WORD_XP_REVERSE_BONUS;
  }

  if (options.wasOverdue) {
    gainedXp += WORD_XP_OVERDUE_BONUS;
  }

  return Math.max(1, gainedXp + randomXpVariance());
};

export const getWordProgressMap = async (
  playerId: string,
  wordIds: string[],
  db: WordProgressDb = prisma,
): Promise<Map<string, WordProgressState>> => {
  if (!wordIds.length) return new Map();

  const uniqueWordIds = [...new Set(wordIds)];
  const records = await db.wordProgress.findMany({
    where: {
      playerId,
      wordId: { in: uniqueWordIds },
    },
    select: {
      playerId: true,
      wordId: true,
      xp: true,
      level: true,
      lastReviewedAt: true,
      lastDecayAt: true,
    },
  });

  const now = new Date();
  const hydrated = await Promise.all(records.map((record) => hydrateProgress(record, db, now)));

  return new Map(hydrated.map((record) => [record.wordId, record]));
};

export const getWordProgress = async (
  playerId: string,
  wordId: string,
  db: WordProgressDb = prisma,
): Promise<WordProgressState | null> => {
  const record = await db.wordProgress.findUnique({
    where: { playerId_wordId: { playerId, wordId } },
    select: {
      playerId: true,
      wordId: true,
      xp: true,
      level: true,
      lastReviewedAt: true,
      lastDecayAt: true,
    },
  });

  if (!record) return null;
  return hydrateProgress(record, db, new Date());
};

export const awardWordXp = async (
  playerId: string,
  wordId: string,
  options: AwardWordXpOptions,
  db: WordProgressDb = prisma,
  reviewedAt: Date = new Date(),
): Promise<WordXpAwardResult> => {
  const existing = await db.wordProgress.findUnique({
    where: { playerId_wordId: { playerId, wordId } },
    select: {
      playerId: true,
      wordId: true,
      xp: true,
      level: true,
      lastReviewedAt: true,
      lastDecayAt: true,
    },
  });

  const current = existing
    ? await applyDecayIfNeededToRecord(existing, db, reviewedAt)
    : null;
  const oldLevel = current ? calculateLevelFromXp(current.xp).level : 0;
  const xpGained = calculateWordXpGain(options);
  const totalXp = clampWordXp((current?.xp ?? 0) + xpGained);
  const nextLevel = calculateLevelFromXp(totalXp);

  if (current) {
    await db.wordProgress.update({
      where: { playerId_wordId: { playerId, wordId } },
      data: {
        xp: totalXp,
        level: nextLevel.level,
        lastReviewedAt: reviewedAt,
        lastDecayAt: null,
      },
    });
  } else {
    await db.wordProgress.create({
      data: {
        playerId,
        wordId,
        xp: totalXp,
        level: nextLevel.level,
        lastReviewedAt: reviewedAt,
        lastDecayAt: null,
      },
    });
  }

  return {
    xpGained,
    oldLevel,
    newLevel: nextLevel.level,
    leveledUp: nextLevel.level > oldLevel,
    xpInCurrentLevel: nextLevel.xpInCurrentLevel,
    xpForNextLevel: nextLevel.xpForNextLevel,
  };
};
