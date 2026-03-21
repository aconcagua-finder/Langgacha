export type Rarity = "C" | "UC" | "R" | "SR" | "SSR";

export const BOOSTER_SIZE = 5;
export const MASTERY_MAX = 5;
export const CRAFTS_PER_DAY = 1;

export const RARITY_ORDER: Rarity[] = ["C", "UC", "R", "SR", "SSR"];

export const RARITY_CHANCES: Record<Rarity, number> = {
  C: 50,
  UC: 30,
  R: 13,
  SR: 5,
  SSR: 2,
} as const;

export const CONDITION_MODIFIERS: Record<string, number> = {
  Brilliant: 1.1,
  Normal: 1.0,
  Worn: 0.9,
  Deteriorated: 0.75,
} as const;

export const INSPIRATION_BONUS = 0.15;

export const STREAK_THRESHOLD = 3;
export const STREAK_MULTIPLIER = 1.5;

export const MAX_BOOSTERS = 7;
export const BOOSTER_RECHARGE_MS = 10 * 60 * 1000;
export const PITY_THRESHOLD = 10;

export const RAID_MAX_CARDS = 20;
export const RAID_VICTORY_DUST = 100;
export const RAID_VICTORY_BOOSTERS = 1;

export const DUST_PER_DISINTEGRATE: Record<string, number> = {
  C: 5,
  UC: 15,
  R: 50,
  SR: 200,
  SSR: 1000,
} as const;

export const DUST_PER_CRAFT: Record<string, number> = {
  C: 30,
  UC: 60,
  R: 150,
  SR: 400,
  SSR: 1500,
} as const;

export const PROGRESSION_LEVELS: Array<{
  name: string;
  minDominated: number;
  rarities: Rarity[];
}> = [
  { name: "Beginner", minDominated: 0, rarities: ["C"] },
  { name: "Elementary", minDominated: 30, rarities: ["C", "UC"] },
  { name: "Intermediate", minDominated: 80, rarities: ["C", "UC", "R"] },
  { name: "Advanced", minDominated: 150, rarities: ["C", "UC", "R", "SR"] },
  { name: "Master", minDominated: 250, rarities: ["C", "UC", "R", "SR", "SSR"] },
] as const;
