import type { Card, Word } from "@prisma/client";

import { prisma } from "../../db/prisma.js";
import { computeCondition } from "../../shared/condition.js";
import { rollStat, type Rarity } from "../../shared/constants.js";
import { getOrCreateDefaultPlayer } from "../player/player.service.js";
import type { CardCondition, GeneratedCardDto } from "./cards.types.js";

export const rollCondition = (): CardCondition => {
  const r = Math.random();
  if (r < 0.05) return "Brilliant";
  return "Normal";
};

export const mapCardToDto = (card: Card & { word: Word }): GeneratedCardDto => ({
  id: card.id,
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
  condition: computeCondition(card) as CardCondition,
  masteryProgress: card.masteryProgress,
  canEvolve: card.word.canEvolve,
});

const pickRandomWord = async (params?: { rarity?: Rarity }): Promise<Word> => {
  const where = params?.rarity ? { rarity: params.rarity } : undefined;
  const count = await prisma.word.count({ where });
  if (count === 0) {
    if (params?.rarity) throw new Error(`No words found for rarity ${params.rarity}`);
    throw new Error("Word pool is empty. Run seed first.");
  }

  const skip = Math.floor(Math.random() * count);
  const word = await prisma.word.findFirst({
    where,
    skip,
    orderBy: { id: "asc" },
  });

  if (!word) throw new Error("Failed to pick a random word.");
  return word;
};

export const createCardFromWord = async (
  word: Word,
  params?: { playerId?: string },
): Promise<GeneratedCardDto> => {
  const rarity = word.rarity as Rarity;
  const atk = rollStat(rarity, word.baseAtk);
  const def = rollStat(rarity, word.baseDef);
  const playerId = params?.playerId ?? (await getOrCreateDefaultPlayer()).id;

  const created = await prisma.card.create({
    data: {
      wordId: word.id,
      atk,
      def,
      condition: rollCondition(),
      masteryProgress: 0,
      isEvolved: false,
      playerId,
    },
    include: { word: true },
  });

  return mapCardToDto(created);
};

export const generateCardFromPool = async (params?: {
  rarity?: Rarity;
  playerId?: string;
}): Promise<GeneratedCardDto> => {
  const word = await pickRandomWord(params);
  return createCardFromWord(word, { playerId: params?.playerId });
};
