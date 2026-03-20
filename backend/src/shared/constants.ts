export const STAT_RANGES = {
  C: { min: 100, max: 500 },
  UC: { min: 300, max: 1000 },
  R: { min: 600, max: 2000 },
  SR: { min: 1200, max: 4000 },
  SSR: { min: 2500, max: 8000 },
} as const;

export const RANDOMIZATION_FACTOR = 0.2;

export type Rarity = keyof typeof STAT_RANGES;

export const RARITY_CHANCES: Record<Rarity, number> = {
  C: 50,
  UC: 30,
  R: 13,
  SR: 5,
  SSR: 2,
} as const;

export const RARITY_ORDER = ["C", "UC", "R", "SR", "SSR"] as const;

export const RARITY_RANK: Record<Rarity, number> = {
  C: 1,
  UC: 2,
  R: 3,
  SR: 4,
  SSR: 5,
} as const;

export const CONDITION_MODIFIERS: Record<string, number> = {
  Brilliant: 1.1,
  Normal: 1.0,
  Worn: 0.9,
  Deteriorated: 0.75,
};

export const INSPIRATION_BONUS = 0.15;

export const DUST_PER_RARITY_BATTLE: Record<string, number> = {
  C: 2,
  UC: 5,
  R: 10,
  SR: 40,
  SSR: 200,
};

export const CORRECT_ANSWER_DUST = 5;
export const STREAK_THRESHOLD = 3;
export const STREAK_MULTIPLIER = 1.5;
export const BONUS_CARD_CHANCE = 0.2;

export const DUST_PER_DISINTEGRATE: Record<string, number> = {
  C: 5,
  UC: 15,
  R: 50,
  SR: 200,
  SSR: 1000,
};

export const MAX_BOOSTERS = 7;
export const BOOSTER_RECHARGE_MS = 10 * 60 * 1000;

export const DUST_PER_CRAFT: Record<string, number> = {
  C: 30,
  UC: 60,
  R: 150,
  SR: 400,
  SSR: 1500,
};

export const STARTING_DUST = 100;

export const PROGRESSION_LEVELS = [
  { name: "Beginner", minDominated: 0, rarities: ["C"] },
  { name: "Elementary", minDominated: 30, rarities: ["C", "UC"] },
  { name: "Intermediate", minDominated: 80, rarities: ["C", "UC", "R"] },
  { name: "Advanced", minDominated: 150, rarities: ["C", "UC", "R", "SR"] },
  { name: "Master", minDominated: 250, rarities: ["C", "UC", "R", "SR", "SSR"] },
] as const;

export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export const randomBetween = (min: number, max: number): number =>
  min + Math.random() * (max - min);

export const rollStat = (rarity: Rarity, basePercent: number): number => {
  const range = STAT_RANGES[rarity];
  const base = range.min + ((range.max - range.min) * basePercent) / 100;
  const multiplier = 1 + randomBetween(-RANDOMIZATION_FACTOR, RANDOMIZATION_FACTOR);
  const rolled = base * multiplier;
  return Math.round(clamp(rolled, range.min, range.max));
};

export const rollRarity = (allowed?: Rarity[]): Rarity => {
  const pool = (allowed?.length ? allowed : (RARITY_ORDER as unknown as Rarity[])).filter(
    (r) => RARITY_CHANCES[r] > 0,
  );

  const total = pool.reduce((sum, r) => sum + RARITY_CHANCES[r], 0);
  let roll = Math.random() * total;
  for (const r of pool) {
    roll -= RARITY_CHANCES[r];
    if (roll <= 0) return r;
  }
  return pool[pool.length - 1] ?? "C";
};
