import type { Card, Word } from "@prisma/client";

import { prisma } from "../../db/prisma.js";
import { computeConditionFromReview } from "../../shared/condition.js";
import { rollStat, type Rarity } from "../../shared/constants.js";
import {
  getWordProgress,
  getWordProgressMap,
  type WordProgressState,
} from "../word-progress/word-progress.service.js";
import type { CardCondition, GeneratedCardDto } from "./cards.types.js";

type DbClient = Pick<typeof prisma, "word" | "card" | "wordProgress">;

export const rollCondition = (): CardCondition => {
  const r = Math.random();
  if (r < 0.05) return "Brilliant";
  return "Normal";
};

const toDto = (
  card: Card & { word: Word },
  progress?: WordProgressState | null,
): GeneratedCardDto => ({
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
  condition: computeConditionFromReview(progress?.lastReviewedAt ?? null) as CardCondition,
  masteryProgress: progress?.masteryProgress ?? 0,
  canEvolve: card.word.canEvolve,
  isEvolved: card.isEvolved,
});

export const mapCardToDto = async (
  card: Card & { word: Word },
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
  cards: Array<Card & { word: Word }>,
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

const pickRandomWord = async (
  params?: { rarity?: Rarity; db?: DbClient },
): Promise<Word> => {
  const db = params?.db ?? prisma;
  const where = params?.rarity ? { rarity: params.rarity } : undefined;
  const count = await db.word.count({ where });
  if (count === 0) {
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
    include: { word: true },
  });

  return mapCardToDto(created, { playerId, db });
};

export const generateCardFromPool = async (params: {
  rarity?: Rarity;
  playerId: string;
  db?: DbClient;
}): Promise<GeneratedCardDto> => {
  const word = await pickRandomWord(params);
  return createCardFromWord(word, { playerId: params.playerId, db: params.db });
};
