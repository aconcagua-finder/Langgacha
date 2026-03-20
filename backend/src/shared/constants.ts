export const STAT_RANGES = {
  C: { min: 100, max: 500 },
  UC: { min: 300, max: 1000 },
  R: { min: 600, max: 2000 },
  SR: { min: 1200, max: 4000 },
  SSR: { min: 2500, max: 8000 },
} as const;

export const RANDOMIZATION_FACTOR = 0.2;

export type Rarity = keyof typeof STAT_RANGES;

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

