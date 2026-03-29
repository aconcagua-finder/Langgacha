import { prisma } from "../../db/prisma.js";
import {
  WORD_LEVEL_MAX,
  WORD_REVIEW_INTERVAL_DAYS,
  WORD_XP_DECAY_GRACE_MULTIPLIER,
  WORD_XP_DECAY_RATE,
} from "../../shared/constants.js";
import { calculateLevelFromXp, getWordLevelStartXp } from "./word-progress.utils.js";

const DAY_MS = 1000 * 60 * 60 * 24;

type WordProgressDb = Pick<typeof prisma, "wordProgress">;

export type WordProgressDecayRecord = {
  playerId: string;
  wordId: string;
  xp: number;
  level: number;
  lastReviewedAt: Date | null;
  lastDecayAt: Date | null;
};

const getDecayIntervalDays = (level: number): number =>
  WORD_REVIEW_INTERVAL_DAYS[level] ??
  WORD_REVIEW_INTERVAL_DAYS[WORD_LEVEL_MAX] ??
  1;

const getDecayUpdate = (
  progress: WordProgressDecayRecord,
  now: Date,
): { xp: number; lastDecayAt: Date } | null => {
  if (!progress.lastReviewedAt) return null;

  const effectiveLevel = calculateLevelFromXp(progress.xp).level;
  const reviewTime = progress.lastReviewedAt.getTime();
  const intervalMs = getDecayIntervalDays(effectiveLevel) * DAY_MS;
  const graceEndsAt = reviewTime + intervalMs * WORD_XP_DECAY_GRACE_MULTIPLIER;
  const decayAnchor = Math.max(graceEndsAt, progress.lastDecayAt?.getTime() ?? 0);
  const overdueDays = Math.floor((now.getTime() - decayAnchor) / DAY_MS);

  if (overdueDays <= 0) return null;

  const floorXp = getWordLevelStartXp(effectiveLevel);
  const xpAboveFloor = Math.max(0, progress.xp - floorXp);
  const retainedXp = Math.round(xpAboveFloor * Math.pow(1 - WORD_XP_DECAY_RATE, overdueDays));

  return {
    xp: Math.max(floorXp, floorXp + retainedXp),
    lastDecayAt: now,
  };
};

export const applyDecayIfNeededToRecord = async (
  progress: WordProgressDecayRecord,
  db: WordProgressDb = prisma,
  now: Date = new Date(),
): Promise<WordProgressDecayRecord> => {
  const update = getDecayUpdate(progress, now);
  if (!update) return progress;

  await db.wordProgress.update({
    where: {
      playerId_wordId: {
        playerId: progress.playerId,
        wordId: progress.wordId,
      },
    },
    data: update,
  });

  return {
    ...progress,
    ...update,
  };
};

export const applyDecayIfNeeded = async (
  playerId: string,
  wordId: string,
  db: WordProgressDb = prisma,
  now: Date = new Date(),
): Promise<void> => {
  const progress = await db.wordProgress.findUnique({
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

  if (!progress) return;
  await applyDecayIfNeededToRecord(progress, db, now);
};
