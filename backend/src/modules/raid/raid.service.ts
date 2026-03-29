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
import {
  generateQuiz,
  isQuizAnswerCorrect,
  type Quiz,
  type QuizType,
} from "../quiz/index.js";
import {
  awardWordXp,
  getWordProgressMap,
  type WordXpAwardResult,
  type WordProgressState,
} from "../word-progress/word-progress.service.js";

import { generateRaidBoss } from "./raid.boss.js";
import type { NextRaidCard, RaidAttackResult, RaidStatus } from "./raid.types.js";

const todayUtc = (): string => new Date().toISOString().slice(0, 10);
const RAID_QUIZ_TTL_SECONDS = 60 * 10;

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

const toWordXpGain = (
  wordId: string,
  word: string,
  result: WordXpAwardResult,
): RaidAttackResult["wordXpGain"] => ({
  wordId,
  word,
  xpGained: result.xpGained,
  oldLevel: result.oldLevel,
  newLevel: result.newLevel,
  leveledUp: result.leveledUp,
  xpInCurrentLevel: result.xpInCurrentLevel,
  xpForNextLevel: result.xpForNextLevel,
});

type StoredRaidQuiz = {
  type: QuizType;
  correctAnswer: string;
};

const parseStoredRaidQuiz = (raw: string | null): StoredRaidQuiz | null => {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<StoredRaidQuiz>;
    if (
      typeof parsed.correctAnswer === "string" &&
      (parsed.type === "translate" || parsed.type === "reverse" || parsed.type === "typing")
    ) {
      return {
        type: parsed.type,
        correctAnswer: parsed.correctAnswer,
      };
    }
  } catch {
    // Backward compatibility with old raid quiz payloads stored as a raw answer string.
  }

  return {
    type: "translate",
    correctAnswer: raw,
  };
};

const getOrCreateTodayRaidDay = async (playerId?: string) => {
  const date = todayUtc();
  const existing = await prisma.raidDay.findUnique({ where: { date } });
  if (existing) {
    if (!existing.bossTranslationRu) {
      const word = await prisma.word.findFirst({
        where: { word: existing.bossWord },
        select: { translationRu: true },
      });
      if (word?.translationRu) {
        return prisma.raidDay.update({
          where: { id: existing.id },
          data: { bossTranslationRu: word.translationRu },
        });
      }
    }
    return existing;
  }
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
    bossTranslationRu: raidDay.bossTranslationRu,
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
    const condition = computeConditionFromReview(progress?.lastReviewedAt ?? null, progress?.level ?? 0);
    const rank = conditionRank[condition] ?? 2;
    const wordLevel = progress?.level ?? 0;
    return { card: c, rank, wordLevel, r: Math.random() };
  });

  prepared.sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;
    if (a.wordLevel !== b.wordLevel) return a.wordLevel - b.wordLevel;
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
    wordLevel: chosenProgress?.level ?? 0,
    isEvolved: chosen.isEvolved,
    evolutionData: chosen.word.evolutionData,
    wordType: chosen.word.type,
    rarity: chosen.word.rarity,
    language: chosen.word.language,
  });

  await battleStore.set(
    raidQuizKey(playerId, chosen.id),
    JSON.stringify({
      type: quiz.type,
      correctAnswer: quiz.correctAnswer,
    } satisfies StoredRaidQuiz),
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
  const savedQuiz = parseStoredRaidQuiz(await battleStore.get(quizKey));

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

    const correctAnswer = savedQuiz?.correctAnswer ?? card.word.quizCorrect;
    const quizType = savedQuiz?.type ?? "translate";
    const quizCorrect = isQuizAnswerCorrect(quizType, answer, correctAnswer);
    const inspirationApplied = quizCorrect;

    const wordProgress = await tx.wordProgress.findUnique({
      where: { playerId_wordId: { playerId, wordId: card.wordId } },
      select: {
        playerId: true,
        wordId: true,
        xp: true,
        level: true,
        lastReviewedAt: true,
        lastDecayAt: true,
      },
    });

    const effectiveCondition = computeConditionFromReview(
      wordProgress?.lastReviewedAt ?? null,
      wordProgress?.level ?? 0,
    );
    const effectiveAtkBase = applyConditionModifier(card.atk, effectiveCondition);
    const effectiveDef = applyConditionModifier(card.def, effectiveCondition);
    const effectiveAtk = inspirationApplied
      ? Math.round(effectiveAtkBase * (1 + INSPIRATION_BONUS))
      : effectiveAtkBase;

    const bossHpBefore = raid.currentHp;
    let bossHp = bossHpBefore;
    const cardMaxHp = computeHp(effectiveDef);
    let cardHp = cardMaxHp;

    let totalDamageDealt = 0;
    let totalDamageTaken = 0;
    let rounds = 0;

    while (cardHp > 0 && bossHp > 0) {
      const rawCardDamage = computeDamage(effectiveAtk, raid.bossDef, raid.bossHp);
      const cardDamage = Math.min(bossHp, rawCardDamage);
      bossHp -= cardDamage;
      totalDamageDealt += cardDamage;
      rounds += 1;

      if (bossHp <= 0) break;

      const rawBossDamage = computeDamage(raid.bossAtk, effectiveDef, cardMaxHp);
      const bossDamage = Math.min(cardHp, rawBossDamage);
      cardHp -= bossDamage;
      totalDamageTaken += bossDamage;
    }

    const bossCurrentHp = Math.max(0, bossHp);
    const cardFinalHp = Math.max(0, cardHp);
    const cardSurvived = cardFinalHp > 0;
    const bossDefeated = bossCurrentHp <= 0;

    const now = new Date();
    const wordXpGain = quizCorrect
      ? toWordXpGain(
          card.wordId,
          card.word.word,
          await awardWordXp(
            playerId,
            card.wordId,
            {
              quizType,
              wasOverdue:
                effectiveCondition === "Worn" || effectiveCondition === "Deteriorated",
            },
            tx,
            now,
          ),
        )
      : null;

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
      cardHp: cardMaxHp,
      cardFinalHp,
      bossHpBefore,
      bossCurrentHp,
      totalDamageDealt,
      totalDamageTaken,
      rounds,
      cardSurvived,
      bossDefeated,
      dustEarned,
      wordXpGain,
      ...(bossDefeated
        ? { victoryDust: RAID_VICTORY_DUST, victoryBoosters: RAID_VICTORY_BOOSTERS }
        : {}),
    };

    return result;
  });

  await battleStore.del(quizKey);
  return result;
};
