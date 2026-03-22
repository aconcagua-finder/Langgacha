import { randomUUID } from "node:crypto";

import type { Word } from "@prisma/client";

import { prisma } from "../../db/prisma.js";
import { rollStat, type Rarity } from "../../shared/constants.js";
import { rollCondition } from "../cards/cards.generator.js";
import { generateQuiz } from "../quiz/index.js";
import { applyConditionModifier, computeHp } from "./battle.combat.js";
import type { BattleCard } from "./battle.types.js";

const RARITY_ORDER: Rarity[] = ["C", "UC", "R", "SR", "SSR"];

const rarityToRank: Record<string, number> = {
  C: 0,
  UC: 1,
  R: 2,
  SR: 3,
  SSR: 4,
};

const SLOT_TARGET_MIN_FACTOR = 0.85;
const SLOT_TARGET_MAX_FACTOR = 1.15;

const buildBotCard = async (word: Word): Promise<BattleCard> => {
  const rarity = word.rarity as Rarity;
  const rawAtk = rollStat(rarity, word.baseAtk);
  const rawDef = rollStat(rarity, word.baseDef);
  const condition = rollCondition();
  const atk = applyConditionModifier(rawAtk, condition);
  const def = applyConditionModifier(rawDef, condition);
  const quiz = await generateQuiz({
    word: word.word,
    translationRu: word.translationRu,
    quizCorrect: word.quizCorrect,
    quizOptions: word.quizOptions,
    masteryProgress: 0,
    isEvolved: false,
    evolutionData: word.evolutionData,
    wordType: word.type,
    rarity: word.rarity,
    language: word.language,
  });
  return {
    id: `bot:${randomUUID()}`,
    conceptKey: word.conceptKey,
    word: word.word,
    translationRu: word.translationRu,
    type: word.type,
    rarity: word.rarity,
    atk,
    def,
    hp: computeHp(def),
    condition,
    quiz,
  };
};

const scaleCardToTargetPower = (card: BattleCard, targetPower: number): BattleCard => {
  const currentPower = card.atk + card.def;
  if (currentPower <= 0) {
    const atk = Math.max(1, Math.round(targetPower / 2));
    const def = Math.max(1, targetPower - atk);
    return { ...card, atk, def, hp: computeHp(def) };
  }

  const scale = targetPower / currentPower;
  const atk = Math.max(1, Math.round(card.atk * scale));
  const def = Math.max(1, Math.round(card.def * scale));
  return { ...card, atk, def, hp: computeHp(def) };
};

export const generateBotDeck = async (playerCards: BattleCard[]): Promise<BattleCard[]> => {
  const pool = await prisma.word.findMany();
  if (pool.length < 5) throw new Error("Not enough words in pool to generate bot deck.");

  const byRarity = new Map<Rarity, Word[]>();
  for (const r of RARITY_ORDER) byRarity.set(r, []);
  for (const w of pool) {
    const r = (w.rarity as Rarity) ?? "C";
    byRarity.get(r)?.push(w);
  }

  const availableRanks = RARITY_ORDER.map((r) => ({
    rarity: r,
    rank: rarityToRank[r],
    count: byRarity.get(r)?.length ?? 0,
  })).filter((x) => x.count > 0);

  const pickClosestRarity = (targetRank: number): Rarity => {
    if (availableRanks.length === 0) return "C";
    let best = availableRanks[0];
    let bestDist = Math.abs(best.rank - targetRank);
    for (const r of availableRanks) {
      const dist = Math.abs(r.rank - targetRank);
      if (dist < bestDist) {
        best = r;
        bestDist = dist;
      }
    }
    return best.rarity;
  };

  const pickWordForRarity = (rarity: Rarity): Word => {
    const list = byRarity.get(rarity) ?? [];
    if (list.length === 0) {
      const fallback = pool[Math.floor(Math.random() * pool.length)];
      if (!fallback) throw new Error("Word pool is empty. Run seed first.");
      return fallback;
    }
    return list[Math.floor(Math.random() * list.length)]!;
  };

  const offsets = [-1, 0, 1] as const;
  return Promise.all(
    playerCards.map(async (playerCard) => {
      const playerRank = rarityToRank[playerCard.rarity] ?? 0;
      const offset = offsets[Math.floor(Math.random() * offsets.length)] ?? 0;
      const targetRank = Math.max(0, Math.min(4, playerRank + offset));
      const rarity = pickClosestRarity(targetRank);
      const botCard = await buildBotCard(pickWordForRarity(rarity));
      const playerPower = playerCard.atk + playerCard.def;
      const targetPower = Math.max(
        2,
        Math.round(
          playerPower *
            (SLOT_TARGET_MIN_FACTOR +
              Math.random() * (SLOT_TARGET_MAX_FACTOR - SLOT_TARGET_MIN_FACTOR)),
        ),
      );

      return scaleCardToTargetPower(botCard, targetPower);
    }),
  );
};
