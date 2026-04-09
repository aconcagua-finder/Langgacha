import type { CardCondition, GeneratedCard } from "../types/card";

/**
 * Phase 2.18 TASK-052: three-tier auto-select for battle decks.
 *
 * Old logic prioritized only card condition (Worn/Deteriorated first). This
 * worked on small pools but broke at scale: new words never entered the deck
 * until they became Worn (which takes a day), so the player missed the
 * critical "first-day exposure" window — the moment of highest attention.
 *
 * New rotation:
 *   Tier 1 — FRESH (~35% of deck): words with wordLevel < 5. These are
 *            new/learning and need aggressive early repetition.
 *   Tier 2 — OVERDUE (~35% of deck): Worn/Deteriorated cards. Classic SRS
 *            catch-up.
 *   Tier 3 — POWER (~30% of deck): strongest remaining cards, for combat.
 *
 * After deduplication by word (strongest instance per word). If a tier is
 * under-filled (e.g. no overdue cards yet), its slots roll over to the
 * remaining tiers so the deck always fills to deckSize.
 */

const FRESH_RATIO = 0.35;
const OVERDUE_RATIO = 0.35;
const FRESH_MAX_LEVEL = 5;

const CONDITION_PRIORITY: Record<CardCondition, number> = {
  Deteriorated: 4,
  Worn: 3,
  Normal: 2,
  Brilliant: 1,
};

const getCardPower = (card: GeneratedCard): number => card.atk + card.def;

const isOverdue = (card: GeneratedCard): boolean =>
  card.condition === "Worn" || card.condition === "Deteriorated";

const isFresh = (card: GeneratedCard): boolean => card.wordLevel < FRESH_MAX_LEVEL;

export const autoSelectBattleCards = (
  cards: GeneratedCard[],
  deckSize: number,
): GeneratedCard[] => {
  // Step 1 — dedupe by word: keep the strongest instance per word.
  const groups = new Map<string, Array<{ card: GeneratedCard; random: number }>>();
  for (const card of cards) {
    const group = groups.get(card.word) ?? [];
    group.push({ card, random: Math.random() });
    groups.set(card.word, group);
  }

  const bestPerWord: GeneratedCard[] = Array.from(groups.values())
    .map(
      (group) =>
        group.sort((a, b) => {
          const powerDiff = getCardPower(b.card) - getCardPower(a.card);
          if (powerDiff !== 0) return powerDiff;
          return b.random - a.random;
        })[0],
    )
    .filter((entry): entry is { card: GeneratedCard; random: number } => Boolean(entry))
    .map(({ card }) => card);

  if (bestPerWord.length <= deckSize) {
    return [...bestPerWord];
  }

  // Step 2 — bucket cards into tiers (each card goes to exactly one tier,
  // priority: fresh > overdue > power). This avoids double-counting.
  const freshPool: GeneratedCard[] = [];
  const overduePool: GeneratedCard[] = [];
  const powerPool: GeneratedCard[] = [];

  for (const card of bestPerWord) {
    if (isFresh(card)) {
      freshPool.push(card);
    } else if (isOverdue(card)) {
      overduePool.push(card);
    } else {
      powerPool.push(card);
    }
  }

  // Sort each pool by its own relevance signal.
  // Fresh: lowest level first (most in need of exposure), then strongest.
  freshPool.sort((a, b) => a.wordLevel - b.wordLevel || getCardPower(b) - getCardPower(a));
  // Overdue: worst condition first, then strongest.
  overduePool.sort((a, b) => {
    const cond =
      (CONDITION_PRIORITY[b.condition] ?? 0) - (CONDITION_PRIORITY[a.condition] ?? 0);
    if (cond !== 0) return cond;
    return getCardPower(b) - getCardPower(a);
  });
  // Power: strongest first.
  powerPool.sort((a, b) => getCardPower(b) - getCardPower(a));

  // Step 3 — calculate target slot count per tier.
  const freshTarget = Math.round(deckSize * FRESH_RATIO);
  const overdueTarget = Math.round(deckSize * OVERDUE_RATIO);
  // Power gets whatever rounding leaves over.
  const powerTarget = Math.max(0, deckSize - freshTarget - overdueTarget);

  const deck: GeneratedCard[] = [];
  const taken = new Set<string>();

  const fillFromPool = (pool: GeneratedCard[], count: number) => {
    let added = 0;
    for (const card of pool) {
      if (added >= count || deck.length >= deckSize) break;
      if (taken.has(card.id)) continue;
      deck.push(card);
      taken.add(card.id);
      added += 1;
    }
  };

  fillFromPool(freshPool, freshTarget);
  fillFromPool(overduePool, overdueTarget);
  fillFromPool(powerPool, powerTarget);

  // Step 4 — fallback fill: any tier was short, use leftovers from other tiers
  // until deck hits target size. Order: fresh > overdue > power (same priority).
  if (deck.length < deckSize) {
    for (const pool of [freshPool, overduePool, powerPool]) {
      for (const card of pool) {
        if (deck.length >= deckSize) break;
        if (taken.has(card.id)) continue;
        deck.push(card);
        taken.add(card.id);
      }
    }
  }

  return deck;
};
