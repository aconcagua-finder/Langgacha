import type { Card, Word, WordTheme } from "@prisma/client";

import { prisma } from "../../db/prisma.js";
import { computeConditionFromReview } from "../../shared/condition.js";
import { rollStat, type Rarity } from "../../shared/constants.js";
import {
  getWordProgress,
  getWordProgressMap,
  type WordProgressState,
} from "../word-progress/word-progress.service.js";
import type { CardCondition, GeneratedCardDto } from "./cards.types.js";

type DbClient = Pick<typeof prisma, "word" | "card" | "wordProgress" | "wordTheme">;

/** Word with its theme links loaded. Optional because legacy code paths may not include them. */
type WordWithThemes = Word & { wordThemes?: WordTheme[] };

export const rollCondition = (): CardCondition => {
  const r = Math.random();
  if (r < 0.05) return "Brilliant";
  return "Normal";
};

const extractThemes = (
  word: WordWithThemes,
): { themes: string[]; primaryTheme: string | null } => {
  const wordThemes = word.wordThemes ?? [];
  if (wordThemes.length === 0) {
    return { themes: [], primaryTheme: null };
  }
  // Sort primary first, then the rest in stable order
  const sorted = [...wordThemes].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return 0;
  });
  const primary = sorted.find((wt) => wt.isPrimary);
  return {
    themes: sorted.map((wt) => wt.themeKey),
    primaryTheme: primary?.themeKey ?? sorted[0]?.themeKey ?? null,
  };
};

const toDto = (
  card: Card & { word: WordWithThemes },
  progress?: WordProgressState | null,
): GeneratedCardDto => {
  const { themes, primaryTheme } = extractThemes(card.word);
  return {
    id: card.id,
    conceptKey: card.word.conceptKey,
    word: card.word.word,
    translationRu: card.word.translationRu,
    type: card.word.type,
    rarity: card.word.rarity,
    atk: card.atk,
    def: card.def,
    colorido: card.word.colorido,
    flavorText: card.word.flavorText,
    hint: card.word.hint,
    tags: card.word.tags,
    condition: computeConditionFromReview(
      progress?.lastReviewedAt ?? null,
      progress?.level ?? 0,
    ) as CardCondition,
    wordLevel: progress?.level ?? 0,
    wordXp: progress?.xpInCurrentLevel ?? 0,
    wordXpForNext: progress?.xpForNextLevel ?? 25,
    canEvolve: card.word.canEvolve,
    isEvolved: card.isEvolved,
    cefrLevel: card.word.cefrLevel ?? null,
    isCore: card.word.isCore ?? false,
    themes,
    primaryTheme,
  };
};

export const mapCardToDto = async (
  card: Card & { word: WordWithThemes },
  params?: {
    playerId?: string | null;
    db?: DbClient;
    progress?: WordProgressState | null;
  },
): Promise<GeneratedCardDto> => {
  if (params && "progress" in params) {
    return toDto(card, params.progress ?? null);
  }

  const playerId = params?.playerId ?? card.playerId;
  if (!playerId) return toDto(card, null);

  const progress = await getWordProgress(playerId, card.wordId, params?.db ?? prisma);
  return toDto(card, progress);
};

export const mapCardsToDtos = async (
  cards: Array<Card & { word: WordWithThemes }>,
  playerId?: string | null,
  db: DbClient = prisma,
): Promise<GeneratedCardDto[]> => {
  if (!cards.length) return [];
  if (!playerId) return cards.map((card) => toDto(card, null));

  const progressMap = await getWordProgressMap(
    playerId,
    cards.map((card) => card.wordId),
    db,
  );

  return cards.map((card) => toDto(card, progressMap.get(card.wordId) ?? null));
};

/**
 * CEFR ordering — lower index = earlier unlock.
 * Players with cefrMaxLevel="A2" see words with cefrLevel in {A1, A2}.
 */
const CEFR_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
type CefrLevel = (typeof CEFR_ORDER)[number];

const cefrAllowedLevels = (maxLevel: CefrLevel | undefined): CefrLevel[] => {
  if (!maxLevel) return [...CEFR_ORDER];
  const maxIdx = CEFR_ORDER.indexOf(maxLevel);
  if (maxIdx < 0) return [...CEFR_ORDER];
  return CEFR_ORDER.slice(0, maxIdx + 1) as unknown as CefrLevel[];
};

type PickRandomWordParams = {
  rarity?: Rarity;
  db?: DbClient;
  /** Constrain to words belonging to this theme (via WordTheme). Ignored for Core words. */
  themeKey?: string;
  /** Cap on CEFR level — words stricter than this are excluded. */
  cefrMaxLevel?: CefrLevel;
  /** Exclude core words (used for theme-focused booster slots). */
  excludeCore?: boolean;
  /** Only core words (used for the fallback/core booster slot). */
  coreOnly?: boolean;
};

/**
 * Rarities for which CEFR filter is NOT applied. Rationale: R/SR/SSR are "gacha moments" —
 * rare+interesting cards that should break through even for lower-level players ("you pulled
 * something cool, now learn it"). CEFR gating is for the base C/UC pool which is read every day.
 */
const CEFR_BYPASS_RARITIES = new Set<Rarity>(["R", "SR", "SSR"]);

const pickRandomWord = async (params?: PickRandomWordParams): Promise<Word> => {
  const db = params?.db ?? prisma;

  const where: Record<string, unknown> = {};
  if (params?.rarity) where.rarity = params.rarity;

  if (params?.coreOnly) {
    where.isCore = true;
  } else if (params?.excludeCore) {
    where.isCore = false;
  }

  if (params?.themeKey && !params?.coreOnly) {
    where.wordThemes = { some: { themeKey: params.themeKey } };
  }

  const applyCefrFilter =
    params?.cefrMaxLevel &&
    !(params.rarity && CEFR_BYPASS_RARITIES.has(params.rarity));
  if (applyCefrFilter) {
    const allowed = cefrAllowedLevels(params.cefrMaxLevel);
    // Null cefrLevel = treated as A1 (most permissive legacy default)
    where.OR = [{ cefrLevel: { in: allowed as string[] } }, { cefrLevel: null }];
  }

  const count = await db.word.count({ where });
  if (count === 0) {
    // Graceful fallback chain — relax filters one at a time, in order of importance.
    // Priority: rarity > theme > cefr. If the pool is mis-balanced (e.g. all R-words in
    // the chosen theme are CEFR A2 but the player is A1), we relax cefr first, then theme.
    if (params?.cefrMaxLevel) {
      const { cefrMaxLevel: _dropped, ...rest } = params;
      // eslint-disable-next-line no-console
      console.warn(
        `[cards.generator] No words for theme "${params?.themeKey ?? "*"}" + cefr<=${params.cefrMaxLevel} (rarity=${params.rarity ?? "any"}). Relaxing cefr filter.`,
      );
      return pickRandomWord(rest);
    }
    if (params?.themeKey) {
      const { themeKey: _dropped, ...rest } = params;
      // eslint-disable-next-line no-console
      console.warn(
        `[cards.generator] No words for theme "${params.themeKey}" (rarity=${params.rarity ?? "any"}). Relaxing theme filter.`,
      );
      return pickRandomWord(rest);
    }
    if (params?.rarity) throw new Error(`No words found for rarity ${params.rarity}`);
    throw new Error("Word pool is empty. Run seed first.");
  }

  const skip = Math.floor(Math.random() * count);
  const word = await db.word.findFirst({
    where,
    skip,
    orderBy: { id: "asc" },
  });

  if (!word) throw new Error("Failed to pick a random word.");
  return word;
};

export const createCardFromWord = async (
  word: Word,
  params: { playerId: string; db?: DbClient },
): Promise<GeneratedCardDto> => {
  const db = params.db ?? prisma;
  const rarity = word.rarity as Rarity;
  const atk = rollStat(rarity, word.baseAtk);
  const def = rollStat(rarity, word.baseDef);
  const playerId = params.playerId;

  const created = await db.card.create({
    data: {
      wordId: word.id,
      atk,
      def,
      isEvolved: false,
      playerId,
    },
    include: { word: { include: { wordThemes: true } } },
  });

  return mapCardToDto(created, { playerId, db });
};

export const generateCardFromPool = async (params: {
  rarity?: Rarity;
  playerId: string;
  db?: DbClient;
  themeKey?: string;
  cefrMaxLevel?: CefrLevel;
  excludeCore?: boolean;
  coreOnly?: boolean;
}): Promise<GeneratedCardDto> => {
  const word = await pickRandomWord(params);
  return createCardFromWord(word, { playerId: params.playerId, db: params.db });
};
