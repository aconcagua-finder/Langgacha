import { prisma } from "../../db/prisma.js";
import { PROGRESSION_LEVELS } from "../../shared/constants.js";

import type { PlayerDto, PlayerLevelName } from "./player.types.js";

type ProgressionLevel = (typeof PROGRESSION_LEVELS)[number];

const getLevel = (dominatedCount: number) => {
  let current: ProgressionLevel = PROGRESSION_LEVELS[0];
  for (const level of PROGRESSION_LEVELS) {
    if (dominatedCount >= level.minDominated) current = level;
  }

  const idx = PROGRESSION_LEVELS.findIndex((l) => l.name === current.name);
  const next = idx >= 0 && idx + 1 < PROGRESSION_LEVELS.length ? PROGRESSION_LEVELS[idx + 1] : null;

  return { current, next };
};

export const getOrCreateDefaultPlayer = async () => {
  const existing = await prisma.player.findFirst({ orderBy: { createdAt: "asc" } });
  if (existing) return existing;
  return prisma.player.create({ data: { name: "Player", dust: 0 } });
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

export const getPlayerDto = async (): Promise<PlayerDto> => {
  const player = await getOrCreateDefaultPlayer();
  await ensureCardsHavePlayer(player.id);

  const dominatedCount = await prisma.card.count({
    where: { playerId: player.id, masteryProgress: { gte: 5 } },
  });

  const { current, next } = getLevel(dominatedCount);
  const level = current.name as PlayerLevelName;
  const nextLevel = next?.name ? (next.name as PlayerLevelName) : null;
  const progressToNext = dominatedCount;
  const progressNeeded = next?.minDominated ?? dominatedCount;

  return {
    id: player.id,
    name: player.name,
    dust: player.dust,
    dominatedCount,
    level,
    nextLevel,
    progressToNext,
    progressNeeded,
    unlockedRarities: [...current.rarities],
  };
};

export const getUnlockedRaritiesForPlayer = async (): Promise<string[]> => {
  const dto = await getPlayerDto();
  return dto.unlockedRarities;
};
