import { randomUUID } from "node:crypto";

import type { Card, Word } from "@prisma/client";

import { battleStore } from "../../db/redis.js";
import { prisma } from "../../db/prisma.js";
import { generateCardFromPool } from "../cards/cards.generator.js";
import { applyConditionModifier, computeHp, simulateCombat } from "./battle.combat.js";
import { generateBotDeck } from "./battle.bot.js";
import { applyAnswerReward, polvoForDefeatedBot, shouldDropBonusCard } from "./battle.rewards.js";
import type {
  BattleAnswerResponse,
  BattleCard,
  BattleCardPublic,
  BattleResult,
  BattleStartResponse,
  BattleState,
  RoundResult,
} from "./battle.types.js";

const battleKey = (id: string) => `battle:${id}`;

const toPublicCard = (card: BattleCard): BattleCardPublic => {
  const { quizCorrect: _qc, translationRu: _tr, ...rest } = card;
  return rest;
};

const questionForWord = (word: string): string => `Как переводится «${word}»?`;

const parseState = (raw: string): BattleState => JSON.parse(raw) as BattleState;
const stringifyState = (state: BattleState): string => JSON.stringify(state);

const getState = async (battleId: string): Promise<BattleState | null> => {
  const raw = await battleStore.get(battleKey(battleId));
  if (!raw) return null;
  try {
    return parseState(raw);
  } catch {
    return null;
  }
};

const setState = async (state: BattleState): Promise<void> => {
  await battleStore.set(battleKey(state.id), stringifyState(state));
};

const delState = async (battleId: string): Promise<void> => {
  await battleStore.del(battleKey(battleId));
};

const buildPlayerBattleCard = (card: Card & { word: Word }): BattleCard => {
  const fue = applyConditionModifier(card.fue, card.condition);
  const def = applyConditionModifier(card.def, card.condition);
  return {
    id: card.id,
    word: card.word.word,
    translationRu: card.word.translationRu,
    type: card.word.type,
    rarity: card.word.rarity,
    fue,
    def,
    hp: computeHp(def),
    condition: card.condition,
    quizCorrect: card.word.quizCorrect,
    quizOptions: card.word.quizOptions,
  };
};

const normalizeAnswer = (s: string): string => s.trim().toLowerCase();

const stripQuizCorrect = (card: BattleCard): Omit<BattleCard, "quizCorrect"> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { quizCorrect, ...rest } = card;
  return rest;
};

const incrementMastery = async (cardId: string): Promise<void> => {
  const existing = await prisma.card.findUnique({ where: { id: cardId } });
  if (!existing) return;
  const next = Math.min(5, existing.masteryProgress + 1);
  if (next === existing.masteryProgress) return;
  await prisma.card.update({ where: { id: cardId }, data: { masteryProgress: next } });
};

export const startBattle = async (cardIds: string[]): Promise<BattleStartResponse> => {
  if (!Array.isArray(cardIds) || cardIds.length !== 5) {
    throw new Error("cardIds must contain exactly 5 ids.");
  }
  const unique = new Set(cardIds);
  if (unique.size !== 5) throw new Error("cardIds must not contain duplicates.");

  const cards = await prisma.card.findMany({
    where: { id: { in: cardIds } },
    include: { word: true },
  });

  if (cards.length !== 5) throw new Error("Some cards were not found.");

  const byId = new Map(cards.map((c) => [c.id, c]));
  const ordered = cardIds.map((id) => byId.get(id));
  if (ordered.some((c) => !c)) throw new Error("Some cards were not found.");

  const playerCards = ordered.map((c) => buildPlayerBattleCard(c!));
  const botCards = await generateBotDeck(playerCards);

  const battleId = randomUUID();
  const state: BattleState = {
    id: battleId,
    playerCards,
    botCards,
    playerPos: 0,
    botPos: 0,
    playerHpLeft: playerCards[0].hp,
    botHpLeft: botCards[0].hp,
    currentRound: 1,
    rounds: [],
    correctStreak: 0,
    maxStreak: 0,
    totalCorrect: 0,
    polvoFromAnswers: 0,
    defeatedBotRarities: [],
  };

  await setState(state);

  const firstRound = {
    roundNumber: 1,
    playerCard: toPublicCard(playerCards[0]),
    botCard: toPublicCard(botCards[0]),
    quiz: {
      question: questionForWord(playerCards[0].word),
      options: playerCards[0].quizOptions,
    },
  };

  return {
    battleId,
    playerCards: playerCards.map(toPublicCard),
    botCards: botCards.map(toPublicCard),
    rounds: [firstRound],
  };
};

export const answerRound = async (params: {
  battleId: string;
  roundNumber: number;
  answer: string;
}): Promise<BattleAnswerResponse> => {
  const state = await getState(params.battleId);
  if (!state) throw new Error("Battle not found or expired.");

  if (params.roundNumber !== state.currentRound) {
    throw new Error(`Invalid roundNumber. Expected ${state.currentRound}.`);
  }

  const playerCard = state.playerCards[state.playerPos];
  const botCard = state.botCards[state.botPos];
  if (!playerCard || !botCard) throw new Error("Battle is already finished.");

  const quizCorrect =
    normalizeAnswer(params.answer) === normalizeAnswer(playerCard.quizCorrect);

  let inspiracionApplied = false;
  if (quizCorrect) {
    inspiracionApplied = true;
    state.totalCorrect += 1;
    state.correctStreak += 1;
    state.maxStreak = Math.max(state.maxStreak, state.correctStreak);
    state.polvoFromAnswers += applyAnswerReward({ correctStreak: state.correctStreak });
    await incrementMastery(playerCard.id);
  } else {
    state.correctStreak = 0;
  }

  const combat = simulateCombat({
    player: playerCard,
    bot: botCard,
    playerHp: state.playerHpLeft,
    botHp: state.botHpLeft,
    inspiracionApplied,
  });

  const round: RoundResult = {
    roundNumber: state.currentRound,
    playerCard: stripQuizCorrect(playerCard),
    botCard: stripQuizCorrect(botCard),
    quizCorrect,
    inspiracionApplied,
    combatLog: combat.log,
    winner: combat.winner,
    survivorHpLeft: combat.survivorHpLeft,
  };

  state.rounds.push(round);

  if (combat.winner === "player") {
    state.defeatedBotRarities.push(botCard.rarity);
    state.playerHpLeft = combat.survivorHpLeft;
    state.botPos += 1;
    if (state.botPos < state.botCards.length) {
      state.botHpLeft = state.botCards[state.botPos].hp;
    } else {
      state.botHpLeft = 0;
    }
  } else {
    state.botHpLeft = combat.survivorHpLeft;
    state.playerPos += 1;
    if (state.playerPos < state.playerCards.length) {
      state.playerHpLeft = state.playerCards[state.playerPos].hp;
    } else {
      state.playerHpLeft = 0;
    }
  }

  const finished =
    state.playerPos >= state.playerCards.length || state.botPos >= state.botCards.length;
  if (!finished) {
    state.currentRound += 1;
    await setState(state);
    return { round };
  }

  const winner: "player" | "bot" = state.botPos >= state.botCards.length ? "player" : "bot";

  const polvoFromBots =
    winner === "player"
      ? state.defeatedBotRarities.reduce((sum, r) => sum + polvoForDefeatedBot(r), 0)
      : 0;

  let bonusCard: BattleResult["rewards"]["bonusCard"] = null;
  if (winner === "player" && shouldDropBonusCard()) {
    bonusCard = await generateCardFromPool();
  }

  const battleResult: BattleResult = {
    id: state.id,
    rounds: state.rounds,
    winner,
    rewards: {
      polvo: state.polvoFromAnswers + polvoFromBots,
      bonusCard,
      correctAnswers: state.totalCorrect,
      streak: state.maxStreak,
    },
  };

  await delState(state.id);
  return { round, battleResult };
};
