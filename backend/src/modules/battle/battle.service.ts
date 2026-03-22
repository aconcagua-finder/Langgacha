import { randomUUID } from "node:crypto";

import type { Card, Word } from "@prisma/client";

import { battleStore } from "../../db/redis.js";
import { prisma } from "../../db/prisma.js";
import { computeConditionFromReview } from "../../shared/condition.js";
import { generateCardFromPool } from "../cards/cards.generator.js";
import { addDust } from "../player/player.service.js";
import { generateQuiz, isQuizAnswerCorrect, type Quiz } from "../quiz/index.js";
import {
  getWordProgress,
  getWordProgressMap,
  recordCorrectReview,
  type WordProgressState,
} from "../word-progress/word-progress.service.js";
import { applyConditionModifier, computeHp, simulateCombat } from "./battle.combat.js";
import { generateBotDeck } from "./battle.bot.js";
import { applyAnswerReward, dustForDefeatedBot, shouldDropBonusCard } from "./battle.rewards.js";
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

const toPublicQuiz = (quiz: Quiz): BattleCardPublic["quiz"] => {
  const { correctAnswer: _ca, ...rest } = quiz;
  return rest;
};

const toPublicCard = (card: BattleCard): BattleCardPublic => {
  const { quiz, translationRu: _tr, ...rest } = card;
  return {
    ...rest,
    quiz: toPublicQuiz(quiz),
  };
};

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

const buildPlayerBattleCard = async (
  card: Card & { word: Word },
  progressMap: Map<string, WordProgressState>,
): Promise<BattleCard> => {
  const progress = progressMap.get(card.wordId) ?? null;
  const condition = computeConditionFromReview(progress?.lastReviewedAt ?? null);
  const atk = applyConditionModifier(card.atk, condition);
  const def = applyConditionModifier(card.def, condition);
  const quiz = await generateQuiz({
    word: card.word.word,
    translationRu: card.word.translationRu,
    quizCorrect: card.word.quizCorrect,
    quizOptions: card.word.quizOptions,
    masteryProgress: progress?.masteryProgress ?? 0,
    isEvolved: card.isEvolved,
    evolutionData: card.word.evolutionData,
    wordType: card.word.type,
    rarity: card.word.rarity,
    language: card.word.language,
  });
  return {
    id: card.id,
    conceptKey: card.word.conceptKey,
    word: card.word.word,
    translationRu: card.word.translationRu,
    type: card.word.type,
    rarity: card.word.rarity,
    atk,
    def,
    hp: computeHp(def),
    condition,
    quiz,
  };
};

const regenerateQuiz = async (card: BattleCard, playerId: string): Promise<Quiz> => {
  const refreshed = await prisma.card.findUnique({
    where: { id: card.id },
    include: { word: true },
  });

  if (!refreshed || refreshed.playerId !== playerId) {
    return card.quiz;
  }

  const progress = await getWordProgress(playerId, refreshed.wordId);
  const quiz = await generateQuiz({
    word: refreshed.word.word,
    translationRu: refreshed.word.translationRu,
    quizCorrect: refreshed.word.quizCorrect,
    quizOptions: refreshed.word.quizOptions,
    masteryProgress: progress?.masteryProgress ?? 0,
    isEvolved: refreshed.isEvolved,
    evolutionData: refreshed.word.evolutionData,
    wordType: refreshed.word.type,
    rarity: refreshed.word.rarity,
    language: refreshed.word.language,
  });

  card.quiz = quiz;
  return quiz;
};

const toRoundCard = (card: BattleCard): RoundResult["playerCard"] => {
  const { quiz, ...rest } = card;
  return {
    ...rest,
    quiz: toPublicQuiz(quiz),
  };
};

const onCorrectAnswer = async (cardId: string, playerId: string): Promise<void> => {
  const existing = await prisma.card.findUnique({
    where: { id: cardId },
    select: { wordId: true },
  });
  if (!existing) return;
  await recordCorrectReview(playerId, existing.wordId);
};

export const startBattle = async (playerId: string, cardIds: string[]): Promise<BattleStartResponse> => {
  if (!Array.isArray(cardIds) || cardIds.length !== 5) {
    throw new Error("cardIds must contain exactly 5 ids.");
  }
  const unique = new Set(cardIds);
  if (unique.size !== 5) throw new Error("cardIds must not contain duplicates.");

  const cards = await prisma.card.findMany({
    where: { id: { in: cardIds }, playerId },
    include: { word: true },
  });

  if (cards.length !== 5) throw new Error("Some cards were not found.");

  const byId = new Map(cards.map((c) => [c.id, c]));
  const ordered = cardIds.map((id) => byId.get(id));
  if (ordered.some((c) => !c)) throw new Error("Some cards were not found.");

  const progressMap = await getWordProgressMap(
    playerId,
    ordered.map((card) => card!.wordId),
  );
  const playerCards = await Promise.all(ordered.map((c) => buildPlayerBattleCard(c!, progressMap)));
  const botCards = await generateBotDeck(playerCards);

  const battleId = randomUUID();
  const state: BattleState = {
    id: battleId,
    playerId,
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
    dustFromAnswers: 0,
    defeatedBotRarities: [],
  };

  await setState(state);

  const firstRound = {
    roundNumber: 1,
    playerCard: toPublicCard(playerCards[0]),
    botCard: toPublicCard(botCards[0]),
    quiz: toPublicQuiz(playerCards[0].quiz),
  };

  return {
    battleId,
    playerCards: playerCards.map(toPublicCard),
    botCards: botCards.map(toPublicCard),
    rounds: [firstRound],
  };
};

export const answerRound = async (playerId: string, params: {
  battleId: string;
  roundNumber: number;
  answer: string;
}): Promise<BattleAnswerResponse> => {
  const state = await getState(params.battleId);
  if (!state || state.playerId !== playerId) throw new Error("Battle not found or expired.");

  if (params.roundNumber !== state.currentRound) {
    throw new Error(`Invalid roundNumber. Expected ${state.currentRound}.`);
  }

  const playerCard = state.playerCards[state.playerPos];
  const botCard = state.botCards[state.botPos];
  if (!playerCard || !botCard) throw new Error("Battle is already finished.");

  const quizCorrect = isQuizAnswerCorrect(
    playerCard.quiz.type,
    params.answer,
    playerCard.quiz.correctAnswer,
  );

  let inspirationApplied = false;
  if (quizCorrect) {
    inspirationApplied = true;
    state.totalCorrect += 1;
    state.correctStreak += 1;
    state.maxStreak = Math.max(state.maxStreak, state.correctStreak);
    state.dustFromAnswers += applyAnswerReward({ correctStreak: state.correctStreak });
    await onCorrectAnswer(playerCard.id, state.playerId);
  } else {
    state.correctStreak = 0;
  }

  const combat = simulateCombat({
    player: playerCard,
    bot: botCard,
    playerHp: state.playerHpLeft,
    botHp: state.botHpLeft,
    inspirationApplied,
  });

  const round: RoundResult = {
    roundNumber: state.currentRound,
    playerCard: toRoundCard(playerCard),
    botCard: toRoundCard(botCard),
    quizCorrect,
    correctAnswer: playerCard.quiz.correctAnswer,
    inspirationApplied,
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
    let nextQuiz = toPublicQuiz(state.playerCards[state.playerPos].quiz);
    if (combat.winner === "player") {
      nextQuiz = toPublicQuiz(
        await regenerateQuiz(state.playerCards[state.playerPos], state.playerId),
      );
    }
    state.currentRound += 1;
    await setState(state);
    return { round, nextQuiz };
  }

  const winner: "player" | "bot" = state.botPos >= state.botCards.length ? "player" : "bot";

  const dustFromBots =
    winner === "player"
      ? state.defeatedBotRarities.reduce((sum, r) => sum + dustForDefeatedBot(r), 0)
      : 0;

  let bonusCard: BattleResult["rewards"]["bonusCard"] = null;
  if (winner === "player" && shouldDropBonusCard()) {
    bonusCard = await generateCardFromPool({ playerId });
  }

  const battleResult: BattleResult = {
    id: state.id,
    rounds: state.rounds,
    winner,
    rewards: {
      dust: state.dustFromAnswers + dustFromBots,
      bonusCard,
      correctAnswers: state.totalCorrect,
      streak: state.maxStreak,
    },
  };

  await addDust(playerId, battleResult.rewards.dust);
  await delState(state.id);
  return { round, battleResult };
};
