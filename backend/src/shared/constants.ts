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

