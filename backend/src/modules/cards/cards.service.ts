import type { Prisma } from "@prisma/client";

import { prisma } from "../../db/prisma.js";
import { POLVO_PER_DISINTEGRATE, RARITY_RANK, type Rarity } from "../../shared/constants.js";
import { generateCardFromPool, mapCardToDto } from "./cards.generator.js";
import type { GeneratedCardDto } from "./cards.types.js";
import { addPolvo, ensureCardsHavePlayer, getOrCreateDefaultPlayer } from "../player/player.service.js";

export const generateCard = async (): Promise<GeneratedCardDto> => {
  const player = await getOrCreateDefaultPlayer();
  await ensureCardsHavePlayer(player.id);
  return generateCardFromPool({ playerId: player.id });
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
  const player = await getOrCreateDefaultPlayer();
  await ensureCardsHavePlayer(player.id);

  const types = normalizeList(params.type);
  const rarities = normalizeList(params.rarity);

  const whereWord: Prisma.WordWhereInput = {};
  if (types?.length) whereWord.type = { in: types };
  if (rarities?.length) whereWord.rarity = { in: rarities };

  const where: Prisma.CardWhereInput = {
    playerId: player.id,
    ...(Object.keys(whereWord).length > 0 ? { word: { is: whereWord } } : {}),
  };

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

export const disintegrateCard = async (
  cardId: string,
): Promise<{ polvoGained: number; totalPolvo: number }> => {
  const player = await getOrCreateDefaultPlayer();
  await ensureCardsHavePlayer(player.id);

  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: { word: true },
  });

  if (!card || (card.playerId && card.playerId !== player.id)) {
    throw new Error("Card not found.");
  }

  const rarity = card.word.rarity;
  const polvoGained = POLVO_PER_DISINTEGRATE[rarity] ?? 0;

  await prisma.card.delete({ where: { id: cardId } });
  const totalPolvo = await addPolvo(player.id, polvoGained);

  return { polvoGained, totalPolvo };
};
