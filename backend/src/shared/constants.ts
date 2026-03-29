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
export const BOOSTER_SIZE = 7;
export const PITY_THRESHOLD = 10;

export const DEF_SCALING_FACTOR = 200;
export const BATTLE_DECK_SIZE = 10;

export const RAID_BOSS_HP_MULTIPLIER = 9;
export const RAID_BOSS_ATK_SCALE = 2;
export const RAID_BOSS_DEF_SCALE = 0.8;
export const RAID_BOSS_TOP_CARD_COUNT = 20;
export const RAID_BOSS_DIFFICULTY_MIN = 0.7;
export const RAID_BOSS_DIFFICULTY_MAX = 1.5;
export const RAID_VICTORY_DUST = 100;
export const RAID_VICTORY_BOOSTERS = 1;
export const RAID_PER_ATTACK_DUST = 2;
export const RAID_MAX_CARDS = 20;

export const DUST_PER_CRAFT: Record<string, number> = {
  C: 30,
  UC: 60,
  R: 150,
  SR: 400,
  SSR: 1500,
};

export const STARTING_DUST = 100;
export const CRAFTS_PER_DAY = 1;
export const WORD_LEVEL_MAX = 30;
export const WORD_EVOLUTION_LEVEL = 15;
export const WORD_COLLECTION_WIDTH_LEVEL_THRESHOLD = 5;

export const WORD_XP_PER_LEVEL: Record<number, number> = {
  1: 25,
  2: 25,
  3: 25,
  4: 25,
  5: 25,
  6: 40,
  7: 40,
  8: 40,
  9: 40,
  10: 40,
  11: 60,
  12: 60,
  13: 60,
  14: 60,
  15: 60,
  16: 90,
  17: 90,
  18: 90,
  19: 90,
  20: 90,
  21: 130,
  22: 130,
  23: 130,
  24: 130,
  25: 130,
  26: 180,
  27: 180,
  28: 180,
  29: 180,
  30: 180,
};

export const WORD_REVIEW_INTERVAL_DAYS: Record<number, number> = {
  0: 1,
  1: 1,
  2: 1,
  3: 1,
  4: 1,
  5: 1,
  6: 3,
  7: 3,
  8: 3,
  9: 3,
  10: 3,
  11: 7,
  12: 7,
  13: 7,
  14: 7,
  15: 7,
  16: 14,
  17: 14,
  18: 14,
  19: 14,
  20: 14,
  21: 30,
  22: 30,
  23: 30,
  24: 30,
  25: 30,
  26: 60,
  27: 60,
  28: 60,
  29: 60,
  30: 60,
};

export const WORD_XP_BASE = 10;
export const WORD_XP_TYPING_BONUS = 5;
export const WORD_XP_REVERSE_BONUS = 3;
export const WORD_XP_OVERDUE_BONUS = 5;
export const WORD_XP_VARIANCE = 2;

export const WORD_XP_DECAY_RATE = 0.05;
export const WORD_XP_DECAY_GRACE_MULTIPLIER = 2;

export const COLLECTION_LEVELS = [
  { name: "A1", gachaName: "Bronze", minWords: 25, minAvgLevel: 5, rarities: ["C"] },
  { name: "A1+", gachaName: "Silver", minWords: 45, minAvgLevel: 8, rarities: ["C", "UC"] },
  { name: "A2", gachaName: "Gold", minWords: 70, minAvgLevel: 10, rarities: ["C", "UC", "R"] },
  {
    name: "A2+",
    gachaName: "Platinum",
    minWords: 100,
    minAvgLevel: 12,
    rarities: ["C", "UC", "R"],
  },
  {
    name: "B1",
    gachaName: "Diamond",
    minWords: 150,
    minAvgLevel: 15,
    rarities: ["C", "UC", "R", "SR"],
  },
  {
    name: "B1+",
    gachaName: "Master",
    minWords: 200,
    minAvgLevel: 18,
    rarities: ["C", "UC", "R", "SR", "SSR"],
  },
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
