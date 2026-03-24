import type { CardCondition, GeneratedCard } from "../types/card";

const CONDITION_PRIORITY: Record<CardCondition, number> = {
  Deteriorated: 4,
  Worn: 3,
  Normal: 2,
  Brilliant: 1,
};

const getCardPower = (card: GeneratedCard): number => card.atk + card.def;

export const autoSelectBattleCards = (
  cards: GeneratedCard[],
  deckSize: number,
): GeneratedCard[] => {
  const groups = new Map<string, Array<{ card: GeneratedCard; random: number }>>();

  for (const card of cards) {
    const groupKey = card.word;
    const group = groups.get(groupKey) ?? [];
    group.push({ card, random: Math.random() });
    groups.set(groupKey, group);
  }

  const bestPerWord = Array.from(groups.values())
    .map((group) =>
      group.sort((a, b) => {
        const powerDiff = getCardPower(b.card) - getCardPower(a.card);
        if (powerDiff !== 0) return powerDiff;
        return b.random - a.random;
      })[0],
    )
    .filter((entry): entry is { card: GeneratedCard; random: number } => Boolean(entry));

  return bestPerWord
    .map(({ card }) => ({ card, random: Math.random() }))
    .sort((a, b) => {
      const conditionDiff =
        (CONDITION_PRIORITY[b.card.condition] ?? 0) - (CONDITION_PRIORITY[a.card.condition] ?? 0);
      if (conditionDiff !== 0) return conditionDiff;
      return b.random - a.random;
    })
    .slice(0, deckSize)
    .map(({ card }) => card);
};
