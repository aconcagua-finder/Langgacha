import { battleStore } from "../../db/redis.js";
import { prisma } from "../../db/prisma.js";
import { computeConditionFromReview } from "../../shared/condition.js";
import {
  INSPIRATION_BONUS,
  MAX_BOOSTERS,
  RAID_MAX_CARDS,
  RAID_PER_ATTACK_DUST,
  RAID_VICTORY_BOOSTERS,
  RAID_VICTORY_DUST,
} from "../../shared/constants.js";
import { applyConditionModifier, computeDamage, computeHp } from "../../shared/combat.js";
import { mapCardToDto } from "../cards/cards.generator.js";
import { generateQuiz, type Quiz } from "../quiz/index.js";
import {
  getWordProgressMap,
  recordCorrectReview,
} from "../word-progress/word-progress.service.js";

import { generateRaidBoss } from "./raid.boss.js";
import type { NextRaidCard, RaidAttackResult, RaidStatus } from "./raid.types.js";

const todayUtc = (): string => new Date().toISOString().slice(0, 10);
const RAID_QUIZ_TTL_SECONDS = 60 * 10;

const normalizeAnswer = (s: string): string => s.trim().toLowerCase();
const raidQuizKey = (playerId: string, cardId: string): string => `raid:quiz:${playerId}:${cardId}`;

const toPublicQuiz = (quiz: Quiz): NextRaidCard["quiz"] => {
  const { correctAnswer: _ca, ...rest } = quiz;
  return rest;
};

const conditionRank: Record<string, number> = {
  Deteriorated: 0,
  Worn: 1,
  Normal: 2,
  Brilliant: 3,
};

const getOrCreateTodayRaidDay = async (playerId?: string) => {
  const date = todayUtc();
  const existing = await prisma.raidDay.findUnique({ where: { date } });
  if (existing) return existing;
  return generateRaidBoss(date, playerId);
};

export const getTodayRaid = async (playerId: string): Promise<RaidStatus> => {
  const raidDay = await getOrCreateTodayRaidDay(playerId);

  const [totalCards, usedCardsAgg, damageAgg] = await Promise.all([
    prisma.card.count({ where: { playerId } }),
    prisma.raidAttack.count({ where: { raidDayId: raidDay.id, playerId } }),
    prisma.raidAttack.aggregate({
      where: { raidDayId: raidDay.id, playerId },
      _sum: { damage: true },
    }),
  ]);

  return {
    id: raidDay.id,
    date: raidDay.date,
    bossWord: raidDay.bossWord,
    bossHp: raidDay.bossHp,
    currentHp: raidDay.currentHp,
    bossAtk: raidDay.bossAtk,
    bossDef: raidDay.bossDef,
    bossRarity: raidDay.bossRarity,
    bossType: raidDay.bossType,
    bossFlavorText: raidDay.bossFlavorText,
    defeated: raidDay.defeated,
    totalCards: Math.min(totalCards, RAID_MAX_CARDS),
    usedCards: usedCardsAgg,
    playerDamage: damageAgg._sum.damage ?? 0,
  };
};

export const getNextCard = async (playerId: string): Promise<NextRaidCard | null> => {
  const raidDay = await getOrCreateTodayRaidDay(playerId);

  const usedCount = await prisma.raidAttack.count({
    where: { raidDayId: raidDay.id, playerId },
  });
  if (usedCount >= RAID_MAX_CARDS) return null;

  const used = await prisma.raidAttack.findMany({
    where: { raidDayId: raidDay.id, playerId },
    select: { cardId: true },
  });
  const usedIds = used.map((u) => u.cardId);

  const cards = await prisma.card.findMany({
    where: {
      playerId,
      ...(usedIds.length ? { id: { notIn: usedIds } } : {}),
    },
    include: { word: true },
  });

  if (!cards.length) return null;

  const wordProgressMap = await getWordProgressMap(
    playerId,
    cards.map((card) => card.wordId),
  );

  const prepared = cards.map((c) => {
    const progress = wordProgressMap.get(c.wordId) ?? null;
    const condition = computeConditionFromReview(progress?.lastReviewedAt ?? null);
    const rank = conditionRank[condition] ?? 2;
    const mastery = progress?.masteryProgress ?? 0;
    return { card: c, rank, mastery, r: Math.random() };
  });

  prepared.sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;
    if (a.mastery !== b.mastery) return a.mastery - b.mastery;
    return a.r - b.r;
  });

  const chosen = prepared[0]?.card;
  if (!chosen) return null;

  const chosenProgress = wordProgressMap.get(chosen.wordId) ?? null;
  const dto = await mapCardToDto(chosen, {
    playerId,
    progress: chosenProgress,
  });
  const quiz = await generateQuiz({
    word: chosen.word.word,
    translationRu: chosen.word.translationRu,
    quizCorrect: chosen.word.quizCorrect,
    quizOptions: chosen.word.quizOptions,
    masteryProgress: chosenProgress?.masteryProgress ?? 0,
    isEvolved: chosen.isEvolved,
    evolutionData: chosen.word.evolutionData,
    wordType: chosen.word.type,
    rarity: chosen.word.rarity,
    language: chosen.word.language,
  });

  await battleStore.set(
    raidQuizKey(playerId, chosen.id),
    quiz.correctAnswer,
    RAID_QUIZ_TTL_SECONDS,
  );

  return {
    card: dto,
    quiz: toPublicQuiz(quiz),
  };
};

export const attackBoss = async (
  playerId: string,
  cardId: string,
  answer: string,
): Promise<RaidAttackResult> => {
  const raidDay = await getOrCreateTodayRaidDay(playerId);
  const quizKey = raidQuizKey(playerId, cardId);
  const savedCorrectAnswer = await battleStore.get(quizKey);

  const result = await prisma.$transaction(async (tx) => {
    const raid = await tx.raidDay.findUnique({ where: { id: raidDay.id } });
    if (!raid) throw new Error("Raid not found.");
    if (raid.defeated) throw new Error("Raid is already defeated.");

    const usedCount = await tx.raidAttack.count({
      where: { raidDayId: raid.id, playerId },
    });
    if (usedCount >= RAID_MAX_CARDS) throw new Error("No raid cards left today.");

    const existingAttack = await tx.raidAttack.findUnique({
      where: { raidDayId_playerId_cardId: { raidDayId: raid.id, playerId, cardId } },
      select: { id: true },
    });
    if (existingAttack) throw new Error("This card has already attacked today.");

    const card = await tx.card.findUnique({
      where: { id: cardId },
      include: { word: true },
    });
    if (!card || card.playerId !== playerId) throw new Error("Card not found.");

    const correctAnswer = savedCorrectAnswer ?? card.word.quizCorrect;
    const quizCorrect = normalizeAnswer(answer) === normalizeAnswer(correctAnswer);
    const inspirationApplied = quizCorrect;

    const wordProgress = await tx.wordProgress.findUnique({
      where: { playerId_wordId: { playerId, wordId: card.wordId } },
      select: { masteryProgress: true, lastReviewedAt: true },
    });

    const effectiveCondition = computeConditionFromReview(wordProgress?.lastReviewedAt ?? null);
    const effectiveAtkBase = applyConditionModifier(card.atk, effectiveCondition);
    const effectiveDef = applyConditionModifier(card.def, effectiveCondition);
    const effectiveAtk = inspirationApplied
      ? Math.round(effectiveAtkBase * (1 + INSPIRATION_BONUS))
      : effectiveAtkBase;

    const bossHpBefore = raid.currentHp;
    let bossHp = bossHpBefore;
    let cardHp = computeHp(effectiveDef);

    let totalDamageDealt = 0;
    let totalDamageTaken = 0;
    let rounds = 0;

    while (cardHp > 0 && bossHp > 0) {
      const rawCardDamage = computeDamage(effectiveAtk, raid.bossDef);
      const cardDamage = Math.min(bossHp, rawCardDamage);
      bossHp -= cardDamage;
      totalDamageDealt += cardDamage;
      rounds += 1;

      if (bossHp <= 0) break;

      const rawBossDamage = computeDamage(raid.bossAtk, effectiveDef);
      const bossDamage = Math.min(cardHp, rawBossDamage);
      cardHp -= bossDamage;
      totalDamageTaken += bossDamage;
    }

    const bossCurrentHp = Math.max(0, bossHp);
    const cardFinalHp = Math.max(0, cardHp);
    const cardSurvived = cardFinalHp > 0;
    const bossDefeated = bossCurrentHp <= 0;

    const now = new Date();

    if (quizCorrect) {
      await recordCorrectReview(playerId, card.wordId, tx, now);
    }

    await tx.raidAttack.create({
      data: {
        raidDayId: raid.id,
        playerId,
        cardId: card.id,
        damage: totalDamageDealt,
        correct: quizCorrect,
      },
    });

    await tx.raidDay.update({
      where: { id: raid.id },
      data: {
        currentHp: bossCurrentHp,
        defeated: bossDefeated ? true : raid.defeated,
      },
    });

    const dustEarned = quizCorrect ? RAID_PER_ATTACK_DUST : 0;
    const victoryDust = bossDefeated ? RAID_VICTORY_DUST : 0;

    if (dustEarned + victoryDust > 0) {
      await tx.player.update({
        where: { id: playerId },
        data: { dust: { increment: dustEarned + victoryDust } },
      });
    }

    if (bossDefeated) {
      const p = await tx.player.findUnique({
        where: { id: playerId },
        select: { boosterCount: true },
      });
      const nextBoosters = Math.min(
        MAX_BOOSTERS,
        (p?.boosterCount ?? 0) + RAID_VICTORY_BOOSTERS,
      );
      await tx.player.update({
        where: { id: playerId },
        data: { boosterCount: nextBoosters },
      });
    }

    const result: RaidAttackResult = {
      correct: quizCorrect,
      inspirationApplied,
      cardHp: computeHp(effectiveDef),
      cardFinalHp,
      bossHpBefore,
      bossCurrentHp,
      totalDamageDealt,
      totalDamageTaken,
      rounds,
      cardSurvived,
      bossDefeated,
      dustEarned,
      ...(bossDefeated
        ? { victoryDust: RAID_VICTORY_DUST, victoryBoosters: RAID_VICTORY_BOOSTERS }
        : {}),
    };

    return result;
  });

  await battleStore.del(quizKey);
  return result;
};
