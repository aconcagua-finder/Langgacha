import { prisma } from "../../db/prisma.js";
import {
  BOOSTER_RECHARGE_MS,
  PITY_THRESHOLD,
  rollRarity,
  type Rarity,
} from "../../shared/constants.js";
import { generateCardFromPool } from "../cards/cards.generator.js";
import { getPlayerDto } from "../player/player.service.js";
import { publicBoosterInfo, rechargeAndGet } from "./boosters.recharge.js";
import type { OpenBoosterResponse } from "./boosters.types.js";

const UC_PLUS: Rarity[] = ["UC", "R", "SR", "SSR"];
const SR_PLUS: Rarity[] = ["SR", "SSR"];

const getAvailableRarities = async (): Promise<Rarity[]> => {
  const grouped = await prisma.word.groupBy({
    by: ["rarity"],
    _count: { _all: true },
  });
  const set = new Set<Rarity>();
  for (const g of grouped) {
    if (g._count._all > 0) set.add(g.rarity as Rarity);
  }
  // Preserve a stable order for rollRarity
  const order: Rarity[] = ["C", "UC", "R", "SR", "SSR"];
  return order.filter((r) => set.has(r));
};

export const openBooster = async (playerId: string): Promise<OpenBoosterResponse> => {
  const player = await getPlayerDto(playerId);
  const boosterStatus = await rechargeAndGet(playerId);
  if (boosterStatus.count === 0) throw new Error("No boosters available");

  const available = await getAvailableRarities();
  if (available.length === 0) throw new Error("Word pool is empty. Run seed first.");

  const unlocked = (player.unlockedRarities as Rarity[]).filter((r) => available.includes(r));
  const allowed = unlocked.length ? unlocked : (["C"] as Rarity[]);
  const availableUcPlus = UC_PLUS.filter((r) => available.includes(r));
  const availableSrPlus = SR_PLUS.filter((r) => available.includes(r));

  const rolledRarities: Rarity[] = Array.from({ length: 5 }, () =>
    rollRarity(allowed),
  );

  const hasUcPlusRolled = rolledRarities.some((r) => r !== "C");
  if (!hasUcPlusRolled && availableUcPlus.length) {
    rolledRarities[4] = rollRarity(availableUcPlus);
  }

  const { pityCounter } = await prisma.player.findUniqueOrThrow({
    where: { id: playerId },
    select: { pityCounter: true },
  });

  const shouldForceSrPlus =
    availableSrPlus.length > 0 &&
    pityCounter >= PITY_THRESHOLD - 1 &&
    !rolledRarities.some((r) => r === "SR" || r === "SSR");

  if (shouldForceSrPlus) {
    rolledRarities[4] = rollRarity(availableSrPlus);
  }

  const cards = await prisma.$transaction(async (tx) => {
    const created = await Promise.all(
      rolledRarities.map((rarity) => generateCardFromPool({ rarity, playerId, db: tx })),
    );

    if (created.every((c) => c.rarity === "C") && availableUcPlus.length) {
      created[4] = await generateCardFromPool({
        rarity: rollRarity(availableUcPlus),
        playerId,
        db: tx,
      });
    }

    const hasSrPlus = created.some((c) => c.rarity === "SR" || c.rarity === "SSR");
    const nextPity = hasSrPlus ? 0 : pityCounter + 1;

    await tx.player.update({
      where: { id: playerId },
      data: {
        boosterCount: { decrement: 1 },
        pityCounter: nextPity,
      },
    });

    return created;
  });

  const nextCount = Math.max(0, boosterStatus.count - 1);
  const nextRechargeAt =
    nextCount >= boosterStatus.maxBoosters
      ? null
      : new Date(boosterStatus.lastBoosterAt.getTime() + BOOSTER_RECHARGE_MS).toISOString();

  return {
    cards,
    boosterInfo: publicBoosterInfo({
      ...boosterStatus,
      count: nextCount,
      nextRechargeAt,
    }),
  };
};
