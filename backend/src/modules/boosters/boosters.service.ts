import { prisma } from "../../db/prisma.js";
import {
  BOOSTER_CORE_DROP_CHANCE,
  BOOSTER_MAX_CORE_SLOTS,
  BOOSTER_RECHARGE_MS,
  BOOSTER_SIZE,
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

const CEFR_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
type CefrLevel = (typeof CEFR_ORDER)[number];

const isCefrLevel = (value: string): value is CefrLevel =>
  (CEFR_ORDER as readonly string[]).includes(value);

const randomIndex = (length: number): number => Math.floor(Math.random() * length);

const shuffleCards = <T>(items: T[]): T[] => {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
};

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

const resolveCefrMaxLevel = (raw?: string | null): CefrLevel => {
  if (raw && isCefrLevel(raw)) return raw;
  return "A1";
};

/**
 * Pick a random theme available to the player (cefrTier <= player cefrMax).
 * Returns null if no themes exist (seed not run, or filter too strict).
 */
const pickBoosterTheme = async (cefrMaxLevel: CefrLevel): Promise<string | null> => {
  const maxIdx = CEFR_ORDER.indexOf(cefrMaxLevel);
  const allowedTiers = CEFR_ORDER.slice(0, maxIdx + 1) as unknown as string[];

  const themes = await prisma.theme.findMany({
    where: { cefrTier: { in: allowedTiers } },
    select: { key: true },
  });

  if (!themes.length) return null;
  const idx = randomIndex(themes.length);
  return themes[idx]?.key ?? null;
};

/**
 * Decide whether a given booster slot should be Core (fallback global pool)
 * rather than theme-scoped. Respects BOOSTER_MAX_CORE_SLOTS cap.
 */
const planCoreSlots = (totalSlots: number): boolean[] => {
  const plan: boolean[] = [];
  let coreCount = 0;
  for (let i = 0; i < totalSlots; i += 1) {
    const shouldBeCore =
      coreCount < BOOSTER_MAX_CORE_SLOTS && Math.random() < BOOSTER_CORE_DROP_CHANCE;
    plan.push(shouldBeCore);
    if (shouldBeCore) coreCount += 1;
  }
  return plan;
};

export const openBooster = async (
  playerId: string,
  options: { themeKey?: string } = {},
): Promise<OpenBoosterResponse> => {
  const player = await getPlayerDto(playerId);
  const boosterStatus = await rechargeAndGet(playerId);
  if (boosterStatus.count === 0) throw new Error("No boosters available");

  const available = await getAvailableRarities();
  if (available.length === 0) throw new Error("Word pool is empty. Run seed first.");

  const unlocked = (player.unlockedRarities as Rarity[]).filter((r) => available.includes(r));
  const allowed = unlocked.length ? unlocked : (["C"] as Rarity[]);
  const availableUcPlus = UC_PLUS.filter((r) => available.includes(r));
  const availableSrPlus = SR_PLUS.filter((r) => available.includes(r));

  const rolledRarities: Rarity[] = Array.from({ length: BOOSTER_SIZE }, () =>
    rollRarity(allowed),
  );

  const hasUcPlusRolled = rolledRarities.some((r) => r !== "C");
  if (!hasUcPlusRolled && availableUcPlus.length) {
    rolledRarities[randomIndex(rolledRarities.length)] = rollRarity(availableUcPlus);
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
    rolledRarities[randomIndex(rolledRarities.length)] = rollRarity(availableSrPlus);
  }

  // Phase 2.18: resolve theme + core plan for this booster.
  const cefrMaxLevel = resolveCefrMaxLevel(player.cefrMaxLevel);
  const themeKey = options.themeKey ?? (await pickBoosterTheme(cefrMaxLevel));
  const coreSlotPlan = planCoreSlots(BOOSTER_SIZE);

  const cards = await prisma.$transaction(async (tx) => {
    const created = await Promise.all(
      rolledRarities.map((rarity, idx) => {
        const isCoreSlot = coreSlotPlan[idx] ?? false;
        return generateCardFromPool({
          rarity,
          playerId,
          db: tx,
          cefrMaxLevel,
          // A slot is either core-only, or theme-scoped (excluding core).
          ...(isCoreSlot
            ? { coreOnly: true }
            : themeKey
              ? { themeKey, excludeCore: true }
              : {}),
        });
      }),
    );

    if (created.every((c) => c.rarity === "C") && availableUcPlus.length) {
      const idx = randomIndex(created.length);
      const isCoreSlot = coreSlotPlan[idx] ?? false;
      created[idx] = await generateCardFromPool({
        rarity: rollRarity(availableUcPlus),
        playerId,
        db: tx,
        cefrMaxLevel,
        ...(isCoreSlot
          ? { coreOnly: true }
          : themeKey
            ? { themeKey, excludeCore: true }
            : {}),
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
    cards: shuffleCards(cards),
    boosterInfo: publicBoosterInfo({
      ...boosterStatus,
      count: nextCount,
      nextRechargeAt,
    }),
  };
};
