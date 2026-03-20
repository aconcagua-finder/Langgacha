import type { GeneratedCard } from "../types/card";

export type CardGroup = {
  word: string;
  cards: GeneratedCard[];
  bestCard: GeneratedCard;
};

const power = (c: GeneratedCard) => c.fue + c.def;

export const groupCards = (cards: GeneratedCard[]): CardGroup[] => {
  const byWord = new Map<string, GeneratedCard[]>();
  const order: string[] = [];

  for (const c of cards) {
    const key = c.word;
    const existing = byWord.get(key);
    if (!existing) {
      byWord.set(key, [c]);
      order.push(key);
    } else {
      existing.push(c);
    }
  }

  return order.map((word) => {
    const groupCards = byWord.get(word)!;
    let best = groupCards[0];
    for (const c of groupCards) {
      if (power(c) > power(best)) best = c;
    }
    return { word, cards: groupCards, bestCard: best };
  });
};

