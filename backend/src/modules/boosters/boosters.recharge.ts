import { prisma } from "../../db/prisma.js";
import { BOOSTER_RECHARGE_MS, MAX_BOOSTERS } from "../../shared/constants.js";

export type BoosterInfo = {
  count: number;
  maxBoosters: number;
  nextRechargeAt: string | null;
};

type BoosterStatus = BoosterInfo & { lastBoosterAt: Date };

const clampNonNegativeInt = (value: number): number =>
  Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;

export const rechargeAndGet = async (playerId: string): Promise<BoosterStatus> => {
  const player = await prisma.player.findUnique({
    where: { id: playerId },
    select: { boosterCount: true, lastBoosterAt: true },
  });
  if (!player) throw new Error("Player not found.");

  const nowMs = Date.now();
  const lastMs = player.lastBoosterAt.getTime();
  const elapsedMs = Math.max(0, nowMs - lastMs);

  const currentCount = clampNonNegativeInt(player.boosterCount);
  const rechargeCount =
    BOOSTER_RECHARGE_MS > 0 ? Math.floor(elapsedMs / BOOSTER_RECHARGE_MS) : 0;

  let nextCount = Math.min(MAX_BOOSTERS, currentCount + rechargeCount);
  let nextLast = player.lastBoosterAt;

  if (rechargeCount > 0) {
    nextLast = new Date(lastMs + rechargeCount * BOOSTER_RECHARGE_MS);
    await prisma.player.update({
      where: { id: playerId },
      data: {
        boosterCount: nextCount,
        lastBoosterAt: nextLast,
      },
    });
  } else if (currentCount > MAX_BOOSTERS) {
    nextCount = MAX_BOOSTERS;
    await prisma.player.update({
      where: { id: playerId },
      data: { boosterCount: nextCount },
    });
  }

  const nextRechargeAt =
    nextCount >= MAX_BOOSTERS
      ? null
      : new Date(nextLast.getTime() + BOOSTER_RECHARGE_MS).toISOString();

  return { count: nextCount, maxBoosters: MAX_BOOSTERS, nextRechargeAt, lastBoosterAt: nextLast };
};

export const publicBoosterInfo = (status: BoosterStatus): BoosterInfo => ({
  count: status.count,
  maxBoosters: status.maxBoosters,
  nextRechargeAt: status.nextRechargeAt,
});

