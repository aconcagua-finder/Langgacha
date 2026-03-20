import { randomUUID } from "node:crypto";

import type { Word } from "@prisma/client";

import { prisma } from "../../db/prisma.js";
import { rollStat, type Rarity } from "../../shared/constants.js";
import { rollCondition } from "../cards/cards.generator.js";
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

  const avgRank =
    playerCards.reduce((sum, c) => sum + (rarityToRank[c.rarity] ?? 0), 0) /
    playerCards.length;
  const baseRank = Math.max(0, Math.min(4, Math.round(avgRank)));

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
  const botCards = Array.from({ length: 5 }, () => {
    const offset = offsets[Math.floor(Math.random() * offsets.length)] ?? 0;
    const targetRank = Math.max(0, Math.min(4, baseRank + offset));
    const rarity = pickClosestRarity(targetRank);
    return buildBotCard(pickWordForRarity(rarity));
  });

  const currentTotal = botCards.reduce((sum, c) => sum + (c.fue + c.def), 0);
  const scale = currentTotal > 0 ? target / currentTotal : 1;

  return botCards.map((c) => {
    const fue = Math.max(1, Math.round(c.fue * scale));
    const def = Math.max(1, Math.round(c.def * scale));
    return { ...c, fue, def, hp: computeHp(def) };
  });
};
