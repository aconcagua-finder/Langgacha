import { prisma } from "../../db/prisma.js";
import {
  COLLECTION_LEVELS,
  STARTING_DUST,
  WORD_COLLECTION_WIDTH_LEVEL_THRESHOLD,
} from "../../shared/constants.js";
import { publicBoosterInfo, rechargeAndGet } from "../boosters/boosters.recharge.js";
import { getDailyAvailability } from "../craft/craft.time.js";
import { applyDecayIfNeededToRecord } from "../word-progress/word-progress.decay.js";
import { calculateLevelFromXp } from "../word-progress/word-progress.utils.js";

import type { PlayerCollectionLevelName, PlayerDto } from "./player.types.js";

type CollectionLevel = (typeof COLLECTION_LEVELS)[number];

const getCollectionProgress = (progressRecords: Array<{ xp: number; level: number }>) => {
  const normalized = progressRecords.map((record) => ({
    xp: record.xp,
    level: calculateLevelFromXp(record.xp).level,
  }));
  const qualified = normalized.filter(
    (record) => record.level >= WORD_COLLECTION_WIDTH_LEVEL_THRESHOLD,
  );
  const wordsWidth = qualified.length;
  const avgWordLevel = qualified.length
    ? Number(
        (
          qualified.reduce((sum, record) => sum + record.level, 0) / qualified.length
        ).toFixed(1),
      )
    : 0;
  const totalCollectionXp = normalized.reduce((sum, record) => sum + record.xp, 0);

  const achievedIndex = COLLECTION_LEVELS.reduce((best, level, index) => {
    if (wordsWidth >= level.minWords && avgWordLevel >= level.minAvgLevel) {
      return index;
    }
    return best;
  }, -1);

  const current = COLLECTION_LEVELS[Math.max(0, achievedIndex)] ?? COLLECTION_LEVELS[0];
  const next =
    achievedIndex < 0
      ? COLLECTION_LEVELS[0]
      : COLLECTION_LEVELS[achievedIndex + 1] ?? null;

  return {
    current,
    next,
    wordsWidth,
    wordsWidthNeeded: next?.minWords ?? wordsWidth,
    avgWordLevel,
    avgWordLevelNeeded: next?.minAvgLevel ?? avgWordLevel,
    totalCollectionXp,
  };
};

export const getOrCreateDefaultPlayer = async () => {
  const existing = await prisma.player.findFirst({ orderBy: { createdAt: "asc" } });
  if (existing) return existing;
  return prisma.player.create({ data: { name: "Player", dust: STARTING_DUST } });
};

export const ensureCardsHavePlayer = async (playerId: string): Promise<void> => {
  await prisma.card.updateMany({
    where: { playerId: null },
    data: { playerId },
  });
};

export const addDust = async (playerId: string, amount: number): Promise<number> => {
  const updated = await prisma.player.update({
    where: { id: playerId },
    data: { dust: { increment: amount } },
  });
  return updated.dust;
};

export const getPlayerDto = async (playerId: string): Promise<PlayerDto> => {
  const player = await prisma.player.findUnique({ where: { id: playerId } });
  if (!player) throw new Error("Player not found.");

  const [boosterStatus, progressRecords] = await Promise.all([
    rechargeAndGet(playerId),
    prisma.wordProgress.findMany({
      where: { playerId },
      select: {
        playerId: true,
        wordId: true,
        xp: true,
        level: true,
        lastReviewedAt: true,
        lastDecayAt: true,
      },
    }),
  ]);

  const now = new Date();
  const decayedProgress = await Promise.all(
    progressRecords.map((record) => applyDecayIfNeededToRecord(record, prisma, now)),
  );

  const boosterInfo = publicBoosterInfo(boosterStatus);
  const craftAvailability = getDailyAvailability(player.lastCraftAt ?? null);
  const collectionProgress = getCollectionProgress(decayedProgress);
  const collectionLevel = currentLevelName(collectionProgress.current);
  const nextCollectionLevel = collectionProgress.next
    ? currentLevelName(collectionProgress.next)
    : null;

  return {
    id: playerId,
    name: player.name,
    dust: player.dust,
    boosterCount: boosterInfo.count,
    nextBoosterAt: boosterInfo.nextRechargeAt,
    craftAvailable: craftAvailability.available,
    nextCraftAt: craftAvailability.nextAt,
    pityCounter: player.pityCounter ?? 0,
    collectionLevel,
    collectionGachaName: collectionProgress.current.gachaName,
    nextCollectionLevel,
    wordsWidth: collectionProgress.wordsWidth,
    wordsWidthNeeded: collectionProgress.wordsWidthNeeded,
    avgWordLevel: collectionProgress.avgWordLevel,
    avgWordLevelNeeded: collectionProgress.avgWordLevelNeeded,
    totalCollectionXp: collectionProgress.totalCollectionXp,
    unlockedRarities: [...collectionProgress.current.rarities],
  };
};

const currentLevelName = (level: CollectionLevel): PlayerCollectionLevelName =>
  level.name as PlayerCollectionLevelName;

export const getUnlockedRaritiesForPlayer = async (playerId: string): Promise<string[]> => {
  const dto = await getPlayerDto(playerId);
  return dto.unlockedRarities;
};
