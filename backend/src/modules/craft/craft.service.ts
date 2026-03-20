import type { Rarity } from "../../shared/constants.js";

import { prisma } from "../../db/prisma.js";
import { DUST_PER_CRAFT } from "../../shared/constants.js";
import { generateCardFromPool } from "../cards/cards.generator.js";
import { getPlayerDto } from "../player/player.service.js";
import { getDailyAvailability, nextUtcMidnightIso } from "./craft.time.js";
import type { CraftResult } from "./craft.types.js";

export const craftCard = async (playerId: string, rarity: string): Promise<CraftResult> => {
  const player = await getPlayerDto(playerId);

  const cost = DUST_PER_CRAFT[rarity] ?? null;
  if (!cost) throw new Error("Invalid rarity");

  if (!player.unlockedRarities.includes(rarity)) throw new Error("Rarity not unlocked");
  if (player.dust < cost) throw new Error("Not enough Dust");

  const current = await prisma.player.findUnique({
    where: { id: playerId },
    select: { lastCraftAt: true },
  });
  if (!current) throw new Error("Player not found.");

  const availability = getDailyAvailability(current.lastCraftAt);
  if (!availability.available) throw new Error("Daily craft limit reached");

  const now = new Date();
  const nextCraftAt = nextUtcMidnightIso(now);

  return prisma.$transaction(async (tx) => {
    const updated = await tx.player.update({
      where: { id: playerId },
      data: {
        dust: { decrement: cost },
        lastCraftAt: now,
      },
      select: { dust: true },
    });

    const card = await generateCardFromPool({
      rarity: rarity as Rarity,
      playerId,
      db: tx,
    });

    return {
      card,
      dustSpent: cost,
      dustRemaining: updated.dust,
      nextCraftAt,
    };
  });
};

export const getCraftStatus = async (playerId: string): Promise<{
  available: boolean;
  nextCraftAt: string | null;
}> => {
  await getPlayerDto(playerId);
  const current = await prisma.player.findUnique({
    where: { id: playerId },
    select: { lastCraftAt: true },
  });
  if (!current) throw new Error("Player not found.");
  const availability = getDailyAvailability(current.lastCraftAt);
  return { available: availability.available, nextCraftAt: availability.nextAt };
};
