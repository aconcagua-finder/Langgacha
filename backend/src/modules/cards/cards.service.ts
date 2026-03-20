import type { Prisma } from "@prisma/client";

import { prisma } from "../../db/prisma.js";
import { RARITY_RANK, type Rarity } from "../../shared/constants.js";
import { generateCardFromPool, mapCardToDto } from "./cards.generator.js";
import type { GeneratedCardDto } from "./cards.types.js";

export const generateCard = async (): Promise<GeneratedCardDto> => {
  return generateCardFromPool();
};

export type ListCardsParams = {
  type?: string[] | string;
  rarity?: string[] | string;
  sort?: "newest" | "fue_desc" | "def_desc" | "rarity_desc" | string;
};

const normalizeList = (value?: string[] | string): string[] | undefined => {
  if (!value) return undefined;
  const arr = Array.isArray(value) ? value : value.split(",");
  const cleaned = arr.map((v) => v.trim()).filter(Boolean);
  return cleaned.length ? cleaned : undefined;
};

export const listCards = async (params: ListCardsParams = {}): Promise<GeneratedCardDto[]> => {
  const types = normalizeList(params.type);
  const rarities = normalizeList(params.rarity);

  const whereWord: Prisma.WordWhereInput = {};
  if (types?.length) whereWord.type = { in: types };
  if (rarities?.length) whereWord.rarity = { in: rarities };

  const where: Prisma.CardWhereInput =
    Object.keys(whereWord).length > 0 ? { word: { is: whereWord } } : {};

  const sort = params.sort ?? "newest";
  const orderBy: Prisma.CardOrderByWithRelationInput =
    sort === "fue_desc"
      ? { fue: "desc" }
      : sort === "def_desc"
        ? { def: "desc" }
        : { createdAt: "desc" };

  const cards = await prisma.card.findMany({
    where,
    orderBy,
    include: { word: true },
  });

  if (sort === "rarity_desc") {
    cards.sort((a, b) => {
      const ra = RARITY_RANK[(a.word.rarity as Rarity) ?? "C"] ?? 1;
      const rb = RARITY_RANK[(b.word.rarity as Rarity) ?? "C"] ?? 1;
      if (ra !== rb) return rb - ra;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  return cards.map(mapCardToDto);
};
