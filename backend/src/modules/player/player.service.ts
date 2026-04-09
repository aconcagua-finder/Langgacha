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

import type {
  CefrLevel,
  CollectionRealCefrCoverage,
  PlayerDto,
  ThemeProgressDto,
  ThemeProgressStatus,
} from "./player.types.js";

type CollectionLevel = (typeof COLLECTION_LEVELS)[number];

// Depth threshold for "mastered" — double the learn threshold.
const WORD_MASTERED_LEVEL_THRESHOLD = 10;

// Fallback level (entry) — always exists as the first entry of the ladder.
const ENTRY_LEVEL: CollectionLevel = COLLECTION_LEVELS[0];

/**
 * Given width + avg, find the highest collection level the player qualifies for.
 * A level qualifies iff both wordsWidth >= widthRequired AND avgWordLevel >= minAvgWordLevel.
 * Returns the entry level if even the first tier is not met.
 */
const resolveCollectionLevel = (wordsWidth: number, avgWordLevel: number): CollectionLevel => {
  let current: CollectionLevel = ENTRY_LEVEL;
  for (const level of COLLECTION_LEVELS) {
    if (wordsWidth >= level.widthRequired && avgWordLevel >= level.minAvgWordLevel) {
      current = level;
    } else {
      break;
    }
  }
  return current;
};

const LEVELS_AS_ARRAY: readonly CollectionLevel[] = COLLECTION_LEVELS;

const resolveNextLevel = (
  currentLevel: CollectionLevel,
): CollectionLevel | null => {
  // LEVELS_AS_ARRAY is 0-indexed; currentLevel.level is 1-indexed.
  if (currentLevel.level >= LEVELS_AS_ARRAY.length) return null;
  return LEVELS_AS_ARRAY[currentLevel.level] ?? null;
};

/**
 * Real CEFR coverage: tells the player how close they are to the next academic
 * milestone (A1/A2/B1/B2/C1/C2). Honest percentage — no inflation.
 *
 * - lastAchievedCefr: the last certified tier the player has fully cleared
 * - nextAnchor: the next certified tier ahead (or null at endgame)
 * - percentToNextAnchor: linear interpolation of wordsWidth between the last
 *   achieved anchor (or 0) and the next anchor's widthRequired
 */
const resolveCefrCoverage = (
  wordsWidth: number,
  currentLevel: CollectionLevel,
): CollectionRealCefrCoverage => {
  const certifiedTiers = COLLECTION_LEVELS.filter((lvl) => lvl.cefrCertified);

  // Last achieved CEFR: highest certified tier the player has fully cleared.
  let lastAchievedCefr: CefrLevel | null = null;
  let lastAchievedWidth = 0;
  for (const tier of certifiedTiers) {
    if (wordsWidth >= tier.widthRequired) {
      lastAchievedCefr = tier.realCefr;
      lastAchievedWidth = tier.widthRequired;
    } else {
      break;
    }
  }

  // Next anchor ahead.
  const nextAnchorTier =
    certifiedTiers.find((tier) => tier.widthRequired > wordsWidth) ?? null;

  if (!nextAnchorTier) {
    // Player has cleared every certified anchor.
    return {
      nextAnchor: null,
      nextAnchorWidth: currentLevel.widthRequired,
      percentToNextAnchor: 100,
      lastAchievedCefr,
    };
  }

  const span = nextAnchorTier.widthRequired - lastAchievedWidth;
  const progress = Math.max(0, wordsWidth - lastAchievedWidth);
  const percent = span > 0 ? Math.min(100, Math.round((progress / span) * 100)) : 0;

  return {
    nextAnchor: nextAnchorTier.realCefr,
    nextAnchorWidth: nextAnchorTier.widthRequired,
    percentToNextAnchor: percent,
    lastAchievedCefr,
  };
};

const CEFR_TIER_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

const cefrTiersUpTo = (maxLevel: CefrLevel): string[] => {
  const maxIdx = CEFR_TIER_ORDER.indexOf(maxLevel);
  if (maxIdx < 0) return ["A1"];
  return CEFR_TIER_ORDER.slice(0, maxIdx + 1) as unknown as string[];
};

/**
 * Unlocked themes: all themes whose cefrTier <= player's currently-unlocked CEFR max.
 * Player's CEFR max is the highest certified anchor they've cleared (or A1 by default).
 */
const resolveCefrMaxLevel = (cefrCoverage: CollectionRealCefrCoverage): CefrLevel => {
  return cefrCoverage.lastAchievedCefr ?? "A1";
};

/**
 * Theme progress for every theme in the DB. Status thresholds:
 *   - Locked: theme is above player's CEFR max
 *   - InProgress: percentLearned < 80
 *   - Learned: percentLearned >= 80
 *   - Mastered: percentMastered >= 80 (means at least 80% of words are deeply known)
 */
const buildThemeProgress = async (
  playerId: string,
  cefrMaxLevel: CefrLevel,
): Promise<ThemeProgressDto[]> => {
  // Load all themes + their word count and player's progress joined per theme.
  const themes = await prisma.theme.findMany({
    orderBy: { orderIndex: "asc" },
    include: {
      wordThemes: {
        select: {
          wordId: true,
        },
      },
    },
  });

  // Load all player wordProgress once.
  const progressRecords = await prisma.wordProgress.findMany({
    where: { playerId },
    select: { wordId: true, level: true, xp: true },
  });
  const progressByWordId = new Map<string, { level: number; xp: number }>();
  for (const rec of progressRecords) {
    progressByWordId.set(rec.wordId, { level: rec.level, xp: rec.xp });
  }

  const allowedTiers = new Set(cefrTiersUpTo(cefrMaxLevel));

  const result: ThemeProgressDto[] = themes.map((theme) => {
    const wordsInTheme = theme.wordThemes.map((wt) => wt.wordId);
    const wordsTotal = wordsInTheme.length;

    let wordsLearned = 0;
    let wordsMastered = 0;
    for (const wordId of wordsInTheme) {
      const prog = progressByWordId.get(wordId);
      if (!prog) continue;
      const level = calculateLevelFromXp(prog.xp).level;
      if (level >= WORD_COLLECTION_WIDTH_LEVEL_THRESHOLD) wordsLearned += 1;
      if (level >= WORD_MASTERED_LEVEL_THRESHOLD) wordsMastered += 1;
    }

    const percentLearned = wordsTotal > 0 ? Math.round((wordsLearned / wordsTotal) * 100) : 0;
    const percentMastered =
      wordsTotal > 0 ? Math.round((wordsMastered / wordsTotal) * 100) : 0;

    const locked = !allowedTiers.has(theme.cefrTier);
    let status: ThemeProgressStatus;
    if (locked) {
      status = "Locked";
    } else if (percentMastered >= 80) {
      status = "Mastered";
    } else if (percentLearned >= 80) {
      status = "Learned";
    } else {
      status = "InProgress";
    }

    return {
      themeKey: theme.key,
      themeName: theme.nameRu,
      themeNameEs: theme.nameEs,
      emoji: theme.emoji,
      domain: theme.domain,
      cefrTier: theme.cefrTier as CefrLevel,
      wordsTotal,
      wordsLearned,
      wordsMastered,
      percentLearned,
      percentMastered,
      status,
    };
  });

  // Sort: unlocked by percentLearned desc, locked at the bottom.
  result.sort((a, b) => {
    if (a.status === "Locked" && b.status !== "Locked") return 1;
    if (b.status === "Locked" && a.status !== "Locked") return -1;
    return b.percentLearned - a.percentLearned;
  });

  return result;
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

  const normalized = decayedProgress.map((record) => ({
    level: calculateLevelFromXp(record.xp).level,
    xp: record.xp,
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

  const currentLevel = resolveCollectionLevel(wordsWidth, avgWordLevel);
  const nextLevel = resolveNextLevel(currentLevel);
  const cefrCoverage = resolveCefrCoverage(wordsWidth, currentLevel);
  const cefrMaxLevel = resolveCefrMaxLevel(cefrCoverage);

  const boosterInfo = publicBoosterInfo(boosterStatus);
  const craftAvailability = getDailyAvailability(player.lastCraftAt ?? null);

  // Load unlocked themes + theme progress.
  const allowedTiers = cefrTiersUpTo(cefrMaxLevel);
  const themesRows = await prisma.theme.findMany({
    where: { cefrTier: { in: allowedTiers } },
    select: { key: true },
    orderBy: { orderIndex: "asc" },
  });
  const unlockedThemes = themesRows.map((t) => t.key);

  const themeProgress = await buildThemeProgress(playerId, cefrMaxLevel);

  return {
    id: playerId,
    name: player.name,
    dust: player.dust,
    boosterCount: boosterInfo.count,
    nextBoosterAt: boosterInfo.nextRechargeAt,
    craftAvailable: craftAvailability.available,
    nextCraftAt: craftAvailability.nextAt,
    pityCounter: player.pityCounter ?? 0,

    collectionLevel: currentLevel.level,
    collectionLevelName: currentLevel.name,
    collectionLevelShort: currentLevel.shortName,
    collectionLevelRoman: currentLevel.roman,
    collectionLevelEpoch: currentLevel.epoch,
    collectionLevelCefrCertified: currentLevel.cefrCertified,
    collectionLevelRealCefr: currentLevel.realCefr as CefrLevel | null,

    nextLevelName: nextLevel?.name ?? null,
    nextLevelWidth: nextLevel?.widthRequired ?? currentLevel.widthRequired,
    nextLevelMinAvg: nextLevel?.minAvgWordLevel ?? currentLevel.minAvgWordLevel,

    cefrCoverage,

    wordsWidth,
    widthRequired: currentLevel.widthRequired,
    avgWordLevel,
    minAvgLevel: currentLevel.minAvgWordLevel,
    totalCollectionXp,

    unlockedRarities: [...currentLevel.unlockedRarities],
    unlockedThemes,
    cefrMaxLevel,
    themeProgress,
  };
};

export const getUnlockedRaritiesForPlayer = async (playerId: string): Promise<string[]> => {
  const dto = await getPlayerDto(playerId);
  return dto.unlockedRarities;
};
