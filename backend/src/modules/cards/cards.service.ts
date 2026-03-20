import { prisma } from "../../db/prisma.js";
import { rollStat, type Rarity } from "../../shared/constants.js";
import type { CardCondition, GeneratedCardDto } from "./cards.types.js";

const rollCondition = (): CardCondition => {
  const r = Math.random();
  if (r < 0.05) return "Brillante";
  return "Normal";
};

const mapCard = (card: {
  id: string;
  fue: number;
  def: number;
  condition: string;
  masteryProgress: number;
  word: {
    word: string;
    translationRu: string;
    type: string;
    rarity: string;
    colorido: number;
    flavorText: string;
    hint: string;
    tags: string[];
    canEvolve: boolean;
  };
}): GeneratedCardDto => ({
  id: card.id,
  word: card.word.word,
  translationRu: card.word.translationRu,
  type: card.word.type,
  rarity: card.word.rarity,
  fue: card.fue,
  def: card.def,
  colorido: card.word.colorido,
  flavorText: card.word.flavorText,
  hint: card.word.hint,
  tags: card.word.tags,
  condition: card.condition as CardCondition,
  masteryProgress: card.masteryProgress,
  canEvolve: card.word.canEvolve,
});

export const generateCard = async (): Promise<GeneratedCardDto> => {
  const count = await prisma.word.count();
  if (count === 0) throw new Error("Word pool is empty. Run seed first.");

  const skip = Math.floor(Math.random() * count);
  const word = await prisma.word.findFirst({
    skip,
    orderBy: { id: "asc" },
  });

  if (!word) throw new Error("Failed to pick a random word.");

  const rarity = word.rarity as Rarity;
  const fue = rollStat(rarity, word.baseFue);
  const def = rollStat(rarity, word.baseDef);

  const created = await prisma.card.create({
    data: {
      wordId: word.id,
      fue,
      def,
      condition: rollCondition(),
      masteryProgress: 0,
      isEvolved: false,
    },
    include: { word: true },
  });

  return mapCard(created);
};

export const listCards = async (): Promise<GeneratedCardDto[]> => {
  const cards = await prisma.card.findMany({
    orderBy: { createdAt: "desc" },
    include: { word: true },
  });

  return cards.map(mapCard);
};

