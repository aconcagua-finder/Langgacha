import { prisma } from "../../db/prisma.js";
import { MASTERY_MAX } from "../../shared/constants.js";

type WordProgressDb = Pick<typeof prisma, "wordProgress">;

export type WordProgressState = {
  masteryProgress: number;
  lastReviewedAt: Date | null;
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
      wordId: true,
      masteryProgress: true,
      lastReviewedAt: true,
    },
  });

  return new Map(
    records.map((record) => [
      record.wordId,
      {
        masteryProgress: record.masteryProgress,
        lastReviewedAt: record.lastReviewedAt,
      },
    ]),
  );
};

export const getWordProgress = async (
  playerId: string,
  wordId: string,
  db: WordProgressDb = prisma,
): Promise<WordProgressState | null> => {
  const record = await db.wordProgress.findUnique({
    where: { playerId_wordId: { playerId, wordId } },
    select: { masteryProgress: true, lastReviewedAt: true },
  });

  if (!record) return null;
  return {
    masteryProgress: record.masteryProgress,
    lastReviewedAt: record.lastReviewedAt,
  };
};

export const recordCorrectReview = async (
  playerId: string,
  wordId: string,
  db: WordProgressDb = prisma,
  reviewedAt: Date = new Date(),
): Promise<void> => {
  await db.wordProgress.upsert({
    where: { playerId_wordId: { playerId, wordId } },
    create: {
      playerId,
      wordId,
      masteryProgress: 1,
      lastReviewedAt: reviewedAt,
    },
    update: {
      masteryProgress: { increment: 1 },
      lastReviewedAt: reviewedAt,
    },
  });

  await db.wordProgress.updateMany({
    where: {
      playerId,
      wordId,
      masteryProgress: { gt: MASTERY_MAX },
    },
    data: { masteryProgress: MASTERY_MAX },
  });
};
