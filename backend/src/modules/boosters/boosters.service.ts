import type { Word } from "@prisma/client";

import { prisma } from "../../db/prisma.js";
import {
  BOOSTER_CORE_DROP_CHANCE,
  BOOSTER_DUPLICATE_BIAS_RATIO,
  BOOSTER_DUPLICATE_BIAS_THRESHOLD,
  BOOSTER_MAX_CORE_SLOTS,
  BOOSTER_RECHARGE_MS,
  BOOSTER_SIZE,
  PITY_THRESHOLD,
  WORD_COLLECTION_WIDTH_LEVEL_THRESHOLD,
  rollRarity,
  type Rarity,
} from "../../shared/constants.js";
import { createCardFromWord, generateCardFromPool } from "../cards/cards.generator.js";
import type { GeneratedCardDto } from "../cards/cards.types.js";
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

/**
 * Phase 2.18 TASK-052: count unreviewed words (level < threshold) for
 * the adaptive duplicate bias decision.
 */
const countUnreviewedWords = async (playerId: string): Promise<number> => {
  return prisma.wordProgress.count({
    where: {
      playerId,
      level: { lt: WORD_COLLECTION_WIDTH_LEVEL_THRESHOLD },
    },
  });
};

/**
 * Phase 2.18 TASK-052: pick an existing word from the player's collection
 * (optionally scoped to a theme and rarity) for the duplicate booster slot.
 * Returns null if the player has no matching words yet — caller should
 * fall back to a regular pick.
 */
/**
 * Phase 2.18 TASK-052: pick an existing word from the player's collection
 * (optionally scoped to a theme and rarity) for the duplicate booster slot.
 * Returns null if the player has no matching words yet — caller should
 * fall back to a regular pick.
 */
const pickDuplicateWord = async (
  playerId: string,
  rarity: Rarity,
  themeKey: string | null,
  tx: Pick<typeof prisma, "word">,
): Promise<Word | null> => {
  const where = {
    cards: { some: { playerId } },
    rarity,
    isCore: false,
    ...(themeKey ? { wordThemes: { some: { themeKey } } } : {}),
  };

  const count = await tx.word.count({ where });
  if (count === 0) return null;

  const skip = Math.floor(Math.random() * count);
  const word = await tx.word.findFirst({
    where,
    skip,
    orderBy: { id: "asc" },
  });

  return word;
};

/**
 * Duplicate slot generator: reuses an existing word from the player's
 * collection instead of rolling a new one. If the player has no matching
 * existing words for this rarity/theme combo, falls back to a fresh pick.
 */
const generateDuplicateSlot = async (params: {
  rarity: Rarity;
  playerId: string;
  themeKey: string | null;
  tx: Pick<typeof prisma, "word" | "card" | "wordProgress" | "wordTheme">;
  fallback: () => Promise<GeneratedCardDto>;
}): Promise<GeneratedCardDto> => {
  const word = await pickDuplicateWord(
    params.playerId,
    params.rarity,
    params.themeKey,
    params.tx,
  );
  if (!word) return params.fallback();
  return createCardFromWord(word, {
    playerId: params.playerId,
    db: params.tx,
  });
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

  // Phase 2.18 TASK-052: adaptive duplicate bias.
  // If the player is overloaded with unreviewed words, some booster slots
  // return duplicates of existing words instead of fresh picks. This throttles
  // raw-new-words inflow so the SRS can catch up.
  const unreviewedCount = await countUnreviewedWords(playerId);
  const shouldBiasDuplicates = unreviewedCount > BOOSTER_DUPLICATE_BIAS_THRESHOLD;

  const cards = await prisma.$transaction(async (tx) => {
    const freshSlot = (rarity: Rarity, isCoreSlot: boolean) =>
      generateCardFromPool({
        rarity,
        playerId,
        db: tx,
        cefrMaxLevel,
        ...(isCoreSlot
          ? { coreOnly: true }
          : themeKey
            ? { themeKey, excludeCore: true }
            : {}),
      });

    const generateSlot = (rarity: Rarity, slotIdx: number): Promise<GeneratedCardDto> => {
      const isCoreSlot = coreSlotPlan[slotIdx] ?? false;
      // Core slots are never duplicate-biased — they have their own purpose
      // (dropping fundamental vocabulary into the mix).
      if (isCoreSlot) return freshSlot(rarity, true);

      const isDuplicateSlot =
        shouldBiasDuplicates && Math.random() < BOOSTER_DUPLICATE_BIAS_RATIO;
      if (!isDuplicateSlot) return freshSlot(rarity, false);

      return generateDuplicateSlot({
        rarity,
        playerId,
        themeKey,
        tx,
        fallback: () => freshSlot(rarity, false),
      });
    };

    const created = await Promise.all(
      rolledRarities.map((rarity, idx) => generateSlot(rarity, idx)),
    );

    if (created.every((c) => c.rarity === "C") && availableUcPlus.length) {
      const idx = randomIndex(created.length);
      created[idx] = await generateSlot(rollRarity(availableUcPlus), idx);
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
