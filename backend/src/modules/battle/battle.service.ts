import { randomUUID } from "node:crypto";

import type { Card, Word } from "@prisma/client";

import { battleStore } from "../../db/redis.js";
import { prisma } from "../../db/prisma.js";
import { computeConditionFromReview } from "../../shared/condition.js";
import { BATTLE_DECK_SIZE } from "../../shared/constants.js";
import { generateCardFromPool } from "../cards/cards.generator.js";
import { addDust } from "../player/player.service.js";
import { generateQuiz, isQuizAnswerCorrect, type Quiz } from "../quiz/index.js";
import {
  awardWordXp,
  getWordProgressMap,
  type WordXpAwardResult,
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
  WordXpGain,
} from "./battle.types.js";

const battleKey = (id: string) => `battle:${id}`;

const toPublicQuiz = (quiz: Quiz): BattleCardPublic["quiz"] => {
  const { correctAnswer: _ca, ...rest } = quiz;
  return rest;
};

const toPublicCard = (card: BattleCard): BattleCardPublic => {
  const { quiz, translationRu: _tr, wordId: _wordId, ...rest } = card;
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
  const condition = computeConditionFromReview(progress?.lastReviewedAt ?? null, progress?.level ?? 0);
  const atk = applyConditionModifier(card.atk, condition);
  const def = applyConditionModifier(card.def, condition);
  const quiz = await generateQuiz({
    word: card.word.word,
    translationRu: card.word.translationRu,
    quizCorrect: card.word.quizCorrect,
    quizOptions: card.word.quizOptions,
    wordLevel: progress?.level ?? 0,
    isEvolved: card.isEvolved,
    evolutionData: card.word.evolutionData,
    wordType: card.word.type,
    rarity: card.word.rarity,
    language: card.word.language,
  });
  return {
    id: card.id,
    wordId: card.wordId,
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

const toRoundCard = (card: BattleCard): RoundResult["playerCard"] => {
  const { quiz, wordId: _wordId, ...rest } = card;
  return {
    ...rest,
    quiz: toPublicQuiz(quiz),
  };
};

const toWordXpGain = (
  card: BattleCard,
  result: WordXpAwardResult,
): WordXpGain => ({
  wordId: card.wordId,
  word: card.word,
  xpGained: result.xpGained,
  oldLevel: result.oldLevel,
  newLevel: result.newLevel,
  leveledUp: result.leveledUp,
  xpInCurrentLevel: result.xpInCurrentLevel,
  xpForNextLevel: result.xpForNextLevel,
});

const mergeWordXpGain = (gains: WordXpGain[], nextGain: WordXpGain): WordXpGain[] => {
  const existing = gains.find((gain) => gain.wordId === nextGain.wordId);
  if (!existing) return [...gains, nextGain];

  existing.xpGained += nextGain.xpGained;
  existing.newLevel = nextGain.newLevel;
  existing.leveledUp = existing.leveledUp || nextGain.leveledUp;
  existing.xpInCurrentLevel = nextGain.xpInCurrentLevel;
  existing.xpForNextLevel = nextGain.xpForNextLevel;

  return gains;
};

export const startBattle = async (playerId: string, cardIds: string[]): Promise<BattleStartResponse> => {
  if (
    !Array.isArray(cardIds) ||
    cardIds.length < 1 ||
    cardIds.length > BATTLE_DECK_SIZE
  ) {
    throw new Error(`cardIds must contain between 1 and ${BATTLE_DECK_SIZE} ids.`);
  }
  const unique = new Set(cardIds);
  if (unique.size !== cardIds.length) throw new Error("cardIds must not contain duplicates.");

  const cards = await prisma.card.findMany({
    where: { id: { in: cardIds }, playerId },
    include: { word: true },
  });

  if (cards.length !== cardIds.length) throw new Error("Some cards were not found.");

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
    currentRound: 1,
    playerWins: 0,
    botWins: 0,
    rounds: [],
    correctStreak: 0,
    maxStreak: 0,
    totalCorrect: 0,
    dustFromAnswers: 0,
    defeatedBotRarities: [],
    wordXpGains: [],
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
    const xpResult = await awardWordXp(state.playerId, playerCard.wordId, {
      quizType: playerCard.quiz.type,
      wasOverdue: playerCard.condition === "Worn" || playerCard.condition === "Deteriorated",
    });
    state.wordXpGains = mergeWordXpGain(state.wordXpGains, toWordXpGain(playerCard, xpResult));
  } else {
    state.correctStreak = 0;
  }

  const combat = simulateCombat({
    player: playerCard,
    bot: botCard,
    playerHp: playerCard.hp,
    botHp: botCard.hp,
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
    state.playerWins += 1;
    state.defeatedBotRarities.push(botCard.rarity);
  } else {
    state.botWins += 1;
  }

  state.playerPos += 1;
  state.botPos += 1;
  state.currentRound += 1;

  const finished =
    state.currentRound > BATTLE_DECK_SIZE ||
    state.playerPos >= state.playerCards.length ||
    state.botPos >= state.botCards.length;

  if (!finished) {
    await setState(state);
    return { round };
  }

  const winner: "player" | "bot" = state.playerWins > state.botWins ? "player" : "bot";

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
    playerWins: state.playerWins,
    botWins: state.botWins,
    rewards: {
      dust: state.dustFromAnswers + dustFromBots,
      bonusCard,
      correctAnswers: state.totalCorrect,
      streak: state.maxStreak,
      wordXpGains: state.wordXpGains,
    },
  };

  await addDust(playerId, battleResult.rewards.dust);
  await delState(state.id);
  return { round, battleResult };
};
