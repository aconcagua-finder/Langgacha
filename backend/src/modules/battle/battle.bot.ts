import { randomUUID } from "node:crypto";

import type { Word } from "@prisma/client";

import { prisma } from "../../db/prisma.js";
import { rollStat, type Rarity } from "../../shared/constants.js";
import { rollCondition } from "../cards/cards.generator.js";
import { applyConditionModifier, computeHp } from "./battle.combat.js";
import type { BattleCard } from "./battle.types.js";

const shuffle = <T>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const buildBotCard = (word: Word): BattleCard => {
  const rarity = word.rarity as Rarity;
  const rawFue = rollStat(rarity, word.baseFue);
  const rawDef = rollStat(rarity, word.baseDef);
  const condition = rollCondition();
  const fue = applyConditionModifier(rawFue, condition);
  const def = applyConditionModifier(rawDef, condition);
  return {
    id: `bot:${randomUUID()}`,
    word: word.word,
    translationRu: word.translationRu,
    type: word.type,
    rarity: word.rarity,
    fue,
    def,
    hp: computeHp(def),
    condition,
    quizCorrect: word.quizCorrect,
    quizOptions: word.quizOptions,
  };
};

export const generateBotDeck = async (playerCards: BattleCard[]): Promise<BattleCard[]> => {
  const totalPlayerPower = playerCards.reduce((sum, c) => sum + (c.fue + c.def), 0);
  const target = totalPlayerPower * (0.8 + Math.random() * 0.4);

  const pool = await prisma.word.findMany();
  if (pool.length < 5) throw new Error("Not enough words in pool to generate bot deck.");

  const picked = shuffle(pool).slice(0, 5);
  const botCards = picked.map(buildBotCard);

  const currentTotal = botCards.reduce((sum, c) => sum + (c.fue + c.def), 0);
  const scale = currentTotal > 0 ? target / currentTotal : 1;

  return botCards.map((c) => {
    const fue = Math.max(1, Math.round(c.fue * scale));
    const def = Math.max(1, Math.round(c.def * scale));
    return { ...c, fue, def, hp: computeHp(def) };
  });
};

