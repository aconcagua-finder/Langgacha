import { prisma } from "../../db/prisma.js";
import { DUST_PER_CRAFT, WORD_EVOLUTION_LEVEL } from "../../shared/constants.js";
import { mapCardToDto } from "../cards/cards.generator.js";
import { getWordProgress } from "../word-progress/word-progress.service.js";

import type { EvolveResult, EvolutionStatus } from "./evolution.types.js";

const getOwnedCard = async (playerId: string, cardId: string) => {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: { word: true },
  });

  if (!card || card.playerId !== playerId) throw new Error("Card not found.");
  return card;
};

const getStatusReason = (params: {
  wordCanEvolve: boolean;
  isEvolved: boolean;
  wordLevel: number;
  dustAvailable: number;
  dustCost: number;
}): string | null => {
  if (!params.wordCanEvolve) return "This card cannot evolve.";
  if (params.isEvolved) return "This card is already evolved.";
  if (params.wordLevel < WORD_EVOLUTION_LEVEL) return "Word level is too low.";
  if (params.dustAvailable < params.dustCost) return "Not enough Dust.";
  return null;
};

export const getEvolutionStatus = async (
  playerId: string,
  cardId: string,
): Promise<EvolutionStatus> => {
  const [card, player] = await Promise.all([
    getOwnedCard(playerId, cardId),
    prisma.player.findUnique({
      where: { id: playerId },
      select: { dust: true },
    }),
  ]);

  if (!player) throw new Error("Player not found.");

  const progress = await getWordProgress(playerId, card.wordId);
  const wordLevel = progress?.level ?? 0;
  const dustCost = DUST_PER_CRAFT[card.word.rarity] ?? 0;
  const dustAvailable = player.dust;
  const enoughDust = dustAvailable >= dustCost;
  const reason = getStatusReason({
    wordCanEvolve: card.word.canEvolve,
    isEvolved: card.isEvolved,
    wordLevel,
    dustAvailable,
    dustCost,
  });

  return {
    cardId: card.id,
    canEvolve: reason === null,
    reason,
    wordLevel,
    requiredWordLevel: WORD_EVOLUTION_LEVEL,
    dustCost,
    dustAvailable,
    enoughDust,
    wordCanEvolve: card.word.canEvolve,
    isEvolved: card.isEvolved,
  };
};

export const evolveCard = async (
  playerId: string,
  cardId: string,
): Promise<EvolveResult> => {
  return prisma.$transaction(async (tx) => {
    const [card, player, progress] = await Promise.all([
      tx.card.findUnique({
        where: { id: cardId },
        include: { word: true },
      }),
      tx.player.findUnique({
        where: { id: playerId },
        select: { dust: true },
      }),
      tx.card.findUnique({
        where: { id: cardId },
        select: { wordId: true, playerId: true },
      }).then(async (owned) => {
        if (!owned || owned.playerId !== playerId) return null;
        return tx.wordProgress.findUnique({
        where: { playerId_wordId: { playerId, wordId: owned.wordId } },
          select: { xp: true, level: true, lastReviewedAt: true, lastDecayAt: true },
        });
      }),
    ]);

    if (!card || card.playerId !== playerId) throw new Error("Card not found.");
    if (!player) throw new Error("Player not found.");

    const dustCost = DUST_PER_CRAFT[card.word.rarity] ?? 0;
    const reason = getStatusReason({
      wordCanEvolve: card.word.canEvolve,
      isEvolved: card.isEvolved,
      wordLevel: progress?.level ?? 0,
      dustAvailable: player.dust,
      dustCost,
    });

    if (reason) throw new Error(reason);

    const updatedPlayer = await tx.player.update({
      where: { id: playerId },
      data: { dust: { decrement: dustCost } },
      select: { dust: true },
    });

    const updatedCard = await tx.card.update({
      where: { id: card.id },
      data: {
        isEvolved: true,
        atk: Math.round(card.atk * 1.2),
        def: Math.round(card.def * 1.2),
      },
      include: { word: true },
    });

    const dto = await mapCardToDto(updatedCard, { playerId, db: tx });

    return {
      card: dto,
      dustSpent: dustCost,
      dustRemaining: updatedPlayer.dust,
    };
  });
};
