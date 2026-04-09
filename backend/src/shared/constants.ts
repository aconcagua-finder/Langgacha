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

// Phase 2.18: thematic boosters
/** Per-slot probability that a booster slot becomes a Core word instead of a theme word. */
export const BOOSTER_CORE_DROP_CHANCE = 0.15;
/** Max number of core slots per booster (cap to keep theme feeling strong). */
export const BOOSTER_MAX_CORE_SLOTS = 2;

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

/**
 * XP required to reach the NEXT level (per-level delta, not cumulative).
 * Phase 2.18 TASK-052 rebalance: phase 1 (levels 1-5) accelerated from 25 to 15
 * (faster "new → familiar" transition, in line with Anki/Duolingo pacing).
 * Phases 2-3 also slightly eased. Deep levels (16+) unchanged — those are
 * SRS polish territory where slower progression is correct.
 */
export const WORD_XP_PER_LEVEL: Record<number, number> = {
  1: 15,
  2: 15,
  3: 15,
  4: 15,
  5: 15,
  6: 30,
  7: 30,
  8: 30,
  9: 30,
  10: 30,
  11: 50,
  12: 50,
  13: 50,
  14: 50,
  15: 50,
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

/**
 * Phase 2.18 TASK-052: initial exposure boost.
 * First correct answers on a new word (while word level < NEW_WORD_LEVEL_CAP)
 * get an extra chunk of XP. Rationale: that's when player attention is
 * highest — leverage it for faster lift-off from level 0 to familiar.
 * A word at level 0 gets 10 + 10 = 20 XP per correct answer, so it jumps
 * 0→1 in one quiz instead of needing 2 quizzes under the old curve.
 */
export const WORD_XP_NEW_WORD_BONUS = 10;
export const WORD_XP_NEW_WORD_LEVEL_CAP = 2;

export const WORD_XP_DECAY_RATE = 0.05;
export const WORD_XP_DECAY_GRACE_MULTIPLIER = 2;

/**
 * Phase 2.18 TASK-052: 100-level collection ladder across three thematic epochs.
 *
 *   Metales (levels 1-30):  Cobre → Bronce → Hierro → Plata → Oro → Platino
 *   Piedras (levels 31-65): Ónix → Jade → Turquesa → Zafiro → Esmeralda → Rubí → Diamante
 *   Cosmos (levels 66-100): Luna → Estrella → Constelación → Nébula → Galaxia → Cosmos → Eternidad
 *
 * Every rank has 5 sub-steps (I–V), so a player sees a tiny level-up every
 * few days of active play. Major rank-ups (e.g. Cobre V → Bronce I) happen
 * every 5 levels with a bigger celebration. And 6 levels are *CEFR certified*:
 *
 *   L25  Oro V       → A1 (500 real words)
 *   L40  Jade V      → A2 (1000 real words)
 *   L55  Esmeralda V → B1 (2000 real words)
 *   L75  Estrella V  → B2 (4000 real words)
 *   L92  Cosmos II   → C1 (8000 real words)
 *   L100 Eternidad V → C2 start (10000 real words — real C2 is ~16000, game caps here)
 *
 * These six are the "real" milestones: they correspond 1:1 to academic CEFR
 * vocabulary thresholds (with ±6% tolerance due to curve rounding). The UI
 * shows a crown badge on certified tiers. Promise to the player: "if your
 * collection says Esmeralda V, you genuinely know ~2000 Spanish words."
 *
 * Rarity unlock curve (column `unlockedRarities`):
 *   L1  (Cobre I)     → C
 *   L6  (Bronce I)    → C, UC
 *   L18 (Plata III)   → C, UC, R
 *   L23 (Oro III)     → C, UC, R, SR
 *   L38 (Jade III)    → C, UC, R, SR, SSR
 *
 * Generator: scripts/_generate-collection-levels.ts (re-run to re-tune).
 */
export const COLLECTION_LEVELS = [
  { level: 1, name: "Cobre I", shortName: "Cobre", roman: "I", epoch: "Metales", widthRequired: 18, minAvgWordLevel: 3.3, realCefr: null, cefrCertified: false, unlockedRarities: ["C"] },
  { level: 2, name: "Cobre II", shortName: "Cobre", roman: "II", epoch: "Metales", widthRequired: 38, minAvgWordLevel: 3.6, realCefr: null, cefrCertified: false, unlockedRarities: ["C"] },
  { level: 3, name: "Cobre III", shortName: "Cobre", roman: "III", epoch: "Metales", widthRequired: 58, minAvgWordLevel: 3.9, realCefr: null, cefrCertified: false, unlockedRarities: ["C"] },
  { level: 4, name: "Cobre IV", shortName: "Cobre", roman: "IV", epoch: "Metales", widthRequired: 78, minAvgWordLevel: 4.2, realCefr: null, cefrCertified: false, unlockedRarities: ["C"] },
  { level: 5, name: "Cobre V", shortName: "Cobre", roman: "V", epoch: "Metales", widthRequired: 98, minAvgWordLevel: 4.5, realCefr: null, cefrCertified: false, unlockedRarities: ["C"] },
  { level: 6, name: "Bronce I", shortName: "Bronce", roman: "I", epoch: "Metales", widthRequired: 118, minAvgWordLevel: 4.8, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC"] },
  { level: 7, name: "Bronce II", shortName: "Bronce", roman: "II", epoch: "Metales", widthRequired: 138, minAvgWordLevel: 5.1, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC"] },
  { level: 8, name: "Bronce III", shortName: "Bronce", roman: "III", epoch: "Metales", widthRequired: 158, minAvgWordLevel: 5.4, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC"] },
  { level: 9, name: "Bronce IV", shortName: "Bronce", roman: "IV", epoch: "Metales", widthRequired: 178, minAvgWordLevel: 5.7, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC"] },
  { level: 10, name: "Bronce V", shortName: "Bronce", roman: "V", epoch: "Metales", widthRequired: 198, minAvgWordLevel: 6.0, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC"] },
  { level: 11, name: "Hierro I", shortName: "Hierro", roman: "I", epoch: "Metales", widthRequired: 218, minAvgWordLevel: 6.2, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC"] },
  { level: 12, name: "Hierro II", shortName: "Hierro", roman: "II", epoch: "Metales", widthRequired: 238, minAvgWordLevel: 6.3, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC"] },
  { level: 13, name: "Hierro III", shortName: "Hierro", roman: "III", epoch: "Metales", widthRequired: 258, minAvgWordLevel: 6.5, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC"] },
  { level: 14, name: "Hierro IV", shortName: "Hierro", roman: "IV", epoch: "Metales", widthRequired: 278, minAvgWordLevel: 6.6, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC"] },
  { level: 15, name: "Hierro V", shortName: "Hierro", roman: "V", epoch: "Metales", widthRequired: 298, minAvgWordLevel: 6.8, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC"] },
  { level: 16, name: "Plata I", shortName: "Plata", roman: "I", epoch: "Metales", widthRequired: 318, minAvgWordLevel: 6.9, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC"] },
  { level: 17, name: "Plata II", shortName: "Plata", roman: "II", epoch: "Metales", widthRequired: 338, minAvgWordLevel: 7.0, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC"] },
  { level: 18, name: "Plata III", shortName: "Plata", roman: "III", epoch: "Metales", widthRequired: 358, minAvgWordLevel: 7.2, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R"] },
  { level: 19, name: "Plata IV", shortName: "Plata", roman: "IV", epoch: "Metales", widthRequired: 376, minAvgWordLevel: 7.3, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R"] },
  { level: 20, name: "Plata V", shortName: "Plata", roman: "V", epoch: "Metales", widthRequired: 395, minAvgWordLevel: 7.5, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R"] },
  { level: 21, name: "Oro I", shortName: "Oro", roman: "I", epoch: "Metales", widthRequired: 414, minAvgWordLevel: 7.7, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R"] },
  { level: 22, name: "Oro II", shortName: "Oro", roman: "II", epoch: "Metales", widthRequired: 435, minAvgWordLevel: 7.8, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R"] },
  { level: 23, name: "Oro III", shortName: "Oro", roman: "III", epoch: "Metales", widthRequired: 457, minAvgWordLevel: 8.0, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR"] },
  { level: 24, name: "Oro IV", shortName: "Oro", roman: "IV", epoch: "Metales", widthRequired: 480, minAvgWordLevel: 8.1, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR"] },
  { level: 25, name: "Oro V", shortName: "Oro", roman: "V", epoch: "Metales", widthRequired: 504, minAvgWordLevel: 8.2, realCefr: "A1", cefrCertified: true, unlockedRarities: ["C", "UC", "R", "SR"] },
  { level: 26, name: "Platino I", shortName: "Platino", roman: "I", epoch: "Metales", widthRequired: 529, minAvgWordLevel: 8.4, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR"] },
  { level: 27, name: "Platino II", shortName: "Platino", roman: "II", epoch: "Metales", widthRequired: 555, minAvgWordLevel: 8.5, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR"] },
  { level: 28, name: "Platino III", shortName: "Platino", roman: "III", epoch: "Metales", widthRequired: 583, minAvgWordLevel: 8.6, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR"] },
  { level: 29, name: "Platino IV", shortName: "Platino", roman: "IV", epoch: "Metales", widthRequired: 612, minAvgWordLevel: 8.7, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR"] },
  { level: 30, name: "Platino V", shortName: "Platino", roman: "V", epoch: "Metales", widthRequired: 643, minAvgWordLevel: 8.8, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR"] },
  { level: 31, name: "Ónix I", shortName: "Ónix", roman: "I", epoch: "Piedras", widthRequired: 672, minAvgWordLevel: 9.0, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR"] },
  { level: 32, name: "Ónix II", shortName: "Ónix", roman: "II", epoch: "Piedras", widthRequired: 702, minAvgWordLevel: 9.1, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR"] },
  { level: 33, name: "Ónix III", shortName: "Ónix", roman: "III", epoch: "Piedras", widthRequired: 734, minAvgWordLevel: 9.2, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR"] },
  { level: 34, name: "Ónix IV", shortName: "Ónix", roman: "IV", epoch: "Piedras", widthRequired: 767, minAvgWordLevel: 9.3, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR"] },
  { level: 35, name: "Ónix V", shortName: "Ónix", roman: "V", epoch: "Piedras", widthRequired: 801, minAvgWordLevel: 9.4, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR"] },
  { level: 36, name: "Jade I", shortName: "Jade", roman: "I", epoch: "Piedras", widthRequired: 837, minAvgWordLevel: 9.6, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR"] },
  { level: 37, name: "Jade II", shortName: "Jade", roman: "II", epoch: "Piedras", widthRequired: 875, minAvgWordLevel: 9.7, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR"] },
  { level: 38, name: "Jade III", shortName: "Jade", roman: "III", epoch: "Piedras", widthRequired: 914, minAvgWordLevel: 9.8, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 39, name: "Jade IV", shortName: "Jade", roman: "IV", epoch: "Piedras", widthRequired: 955, minAvgWordLevel: 9.9, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 40, name: "Jade V", shortName: "Jade", roman: "V", epoch: "Piedras", widthRequired: 998, minAvgWordLevel: 10.1, realCefr: "A2", cefrCertified: true, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 41, name: "Turquesa I", shortName: "Turquesa", roman: "I", epoch: "Piedras", widthRequired: 1043, minAvgWordLevel: 10.2, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 42, name: "Turquesa II", shortName: "Turquesa", roman: "II", epoch: "Piedras", widthRequired: 1090, minAvgWordLevel: 10.3, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 43, name: "Turquesa III", shortName: "Turquesa", roman: "III", epoch: "Piedras", widthRequired: 1139, minAvgWordLevel: 10.4, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 44, name: "Turquesa IV", shortName: "Turquesa", roman: "IV", epoch: "Piedras", widthRequired: 1191, minAvgWordLevel: 10.5, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 45, name: "Turquesa V", shortName: "Turquesa", roman: "V", epoch: "Piedras", widthRequired: 1244, minAvgWordLevel: 10.7, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 46, name: "Zafiro I", shortName: "Zafiro", roman: "I", epoch: "Piedras", widthRequired: 1300, minAvgWordLevel: 10.8, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 47, name: "Zafiro II", shortName: "Zafiro", roman: "II", epoch: "Piedras", widthRequired: 1359, minAvgWordLevel: 10.9, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 48, name: "Zafiro III", shortName: "Zafiro", roman: "III", epoch: "Piedras", widthRequired: 1420, minAvgWordLevel: 11.0, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 49, name: "Zafiro IV", shortName: "Zafiro", roman: "IV", epoch: "Piedras", widthRequired: 1484, minAvgWordLevel: 11.1, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 50, name: "Zafiro V", shortName: "Zafiro", roman: "V", epoch: "Piedras", widthRequired: 1551, minAvgWordLevel: 11.2, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 51, name: "Esmeralda I", shortName: "Esmeralda", roman: "I", epoch: "Piedras", widthRequired: 1620, minAvgWordLevel: 11.4, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 52, name: "Esmeralda II", shortName: "Esmeralda", roman: "II", epoch: "Piedras", widthRequired: 1693, minAvgWordLevel: 11.5, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 53, name: "Esmeralda III", shortName: "Esmeralda", roman: "III", epoch: "Piedras", widthRequired: 1769, minAvgWordLevel: 11.6, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 54, name: "Esmeralda IV", shortName: "Esmeralda", roman: "IV", epoch: "Piedras", widthRequired: 1849, minAvgWordLevel: 11.7, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 55, name: "Esmeralda V", shortName: "Esmeralda", roman: "V", epoch: "Piedras", widthRequired: 1932, minAvgWordLevel: 11.9, realCefr: "B1", cefrCertified: true, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 56, name: "Rubí I", shortName: "Rubí", roman: "I", epoch: "Piedras", widthRequired: 2019, minAvgWordLevel: 12.0, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 57, name: "Rubí II", shortName: "Rubí", roman: "II", epoch: "Piedras", widthRequired: 2110, minAvgWordLevel: 12.1, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 58, name: "Rubí III", shortName: "Rubí", roman: "III", epoch: "Piedras", widthRequired: 2205, minAvgWordLevel: 12.2, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 59, name: "Rubí IV", shortName: "Rubí", roman: "IV", epoch: "Piedras", widthRequired: 2304, minAvgWordLevel: 12.3, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 60, name: "Rubí V", shortName: "Rubí", roman: "V", epoch: "Piedras", widthRequired: 2408, minAvgWordLevel: 12.4, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 61, name: "Diamante I", shortName: "Diamante", roman: "I", epoch: "Piedras", widthRequired: 2516, minAvgWordLevel: 12.5, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 62, name: "Diamante II", shortName: "Diamante", roman: "II", epoch: "Piedras", widthRequired: 2630, minAvgWordLevel: 12.6, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 63, name: "Diamante III", shortName: "Diamante", roman: "III", epoch: "Piedras", widthRequired: 2748, minAvgWordLevel: 12.7, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 64, name: "Diamante IV", shortName: "Diamante", roman: "IV", epoch: "Piedras", widthRequired: 2871, minAvgWordLevel: 12.8, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 65, name: "Diamante V", shortName: "Diamante", roman: "V", epoch: "Piedras", widthRequired: 3001, minAvgWordLevel: 12.9, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 66, name: "Luna I", shortName: "Luna", roman: "I", epoch: "Cosmos", widthRequired: 3106, minAvgWordLevel: 13.1, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 67, name: "Luna II", shortName: "Luna", roman: "II", epoch: "Cosmos", widthRequired: 3214, minAvgWordLevel: 13.2, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 68, name: "Luna III", shortName: "Luna", roman: "III", epoch: "Cosmos", widthRequired: 3327, minAvgWordLevel: 13.3, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 69, name: "Luna IV", shortName: "Luna", roman: "IV", epoch: "Cosmos", widthRequired: 3443, minAvgWordLevel: 13.4, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 70, name: "Luna V", shortName: "Luna", roman: "V", epoch: "Cosmos", widthRequired: 3564, minAvgWordLevel: 13.5, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 71, name: "Estrella I", shortName: "Estrella", roman: "I", epoch: "Cosmos", widthRequired: 3689, minAvgWordLevel: 13.6, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 72, name: "Estrella II", shortName: "Estrella", roman: "II", epoch: "Cosmos", widthRequired: 3818, minAvgWordLevel: 13.7, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 73, name: "Estrella III", shortName: "Estrella", roman: "III", epoch: "Cosmos", widthRequired: 3951, minAvgWordLevel: 13.8, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 74, name: "Estrella IV", shortName: "Estrella", roman: "IV", epoch: "Cosmos", widthRequired: 4090, minAvgWordLevel: 13.9, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 75, name: "Estrella V", shortName: "Estrella", roman: "V", epoch: "Cosmos", widthRequired: 4233, minAvgWordLevel: 14.1, realCefr: "B2", cefrCertified: true, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 76, name: "Constelación I", shortName: "Constelación", roman: "I", epoch: "Cosmos", widthRequired: 4381, minAvgWordLevel: 14.2, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 77, name: "Constelación II", shortName: "Constelación", roman: "II", epoch: "Cosmos", widthRequired: 4534, minAvgWordLevel: 14.3, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 78, name: "Constelación III", shortName: "Constelación", roman: "III", epoch: "Cosmos", widthRequired: 4693, minAvgWordLevel: 14.4, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 79, name: "Constelación IV", shortName: "Constelación", roman: "IV", epoch: "Cosmos", widthRequired: 4857, minAvgWordLevel: 14.5, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 80, name: "Constelación V", shortName: "Constelación", roman: "V", epoch: "Cosmos", widthRequired: 5027, minAvgWordLevel: 14.7, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 81, name: "Nébula I", shortName: "Nébula", roman: "I", epoch: "Cosmos", widthRequired: 5203, minAvgWordLevel: 14.8, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 82, name: "Nébula II", shortName: "Nébula", roman: "II", epoch: "Cosmos", widthRequired: 5385, minAvgWordLevel: 14.9, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 83, name: "Nébula III", shortName: "Nébula", roman: "III", epoch: "Cosmos", widthRequired: 5574, minAvgWordLevel: 15.0, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 84, name: "Nébula IV", shortName: "Nébula", roman: "IV", epoch: "Cosmos", widthRequired: 5769, minAvgWordLevel: 15.1, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 85, name: "Nébula V", shortName: "Nébula", roman: "V", epoch: "Cosmos", widthRequired: 5971, minAvgWordLevel: 15.2, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 86, name: "Galaxia I", shortName: "Galaxia", roman: "I", epoch: "Cosmos", widthRequired: 6180, minAvgWordLevel: 15.4, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 87, name: "Galaxia II", shortName: "Galaxia", roman: "II", epoch: "Cosmos", widthRequired: 6396, minAvgWordLevel: 15.5, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 88, name: "Galaxia III", shortName: "Galaxia", roman: "III", epoch: "Cosmos", widthRequired: 6620, minAvgWordLevel: 15.6, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 89, name: "Galaxia IV", shortName: "Galaxia", roman: "IV", epoch: "Cosmos", widthRequired: 6852, minAvgWordLevel: 15.7, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 90, name: "Galaxia V", shortName: "Galaxia", roman: "V", epoch: "Cosmos", widthRequired: 7091, minAvgWordLevel: 15.9, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 91, name: "Cosmos I", shortName: "Cosmos", roman: "I", epoch: "Cosmos", widthRequired: 7340, minAvgWordLevel: 16.0, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 92, name: "Cosmos II", shortName: "Cosmos", roman: "II", epoch: "Cosmos", widthRequired: 7597, minAvgWordLevel: 16.1, realCefr: "C1", cefrCertified: true, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 93, name: "Cosmos III", shortName: "Cosmos", roman: "III", epoch: "Cosmos", widthRequired: 7862, minAvgWordLevel: 16.2, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 94, name: "Cosmos IV", shortName: "Cosmos", roman: "IV", epoch: "Cosmos", widthRequired: 8138, minAvgWordLevel: 16.4, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 95, name: "Cosmos V", shortName: "Cosmos", roman: "V", epoch: "Cosmos", widthRequired: 8422, minAvgWordLevel: 16.5, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 96, name: "Eternidad I", shortName: "Eternidad", roman: "I", epoch: "Cosmos", widthRequired: 8717, minAvgWordLevel: 16.7, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 97, name: "Eternidad II", shortName: "Eternidad", roman: "II", epoch: "Cosmos", widthRequired: 9022, minAvgWordLevel: 16.8, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 98, name: "Eternidad III", shortName: "Eternidad", roman: "III", epoch: "Cosmos", widthRequired: 9338, minAvgWordLevel: 17.0, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 99, name: "Eternidad IV", shortName: "Eternidad", roman: "IV", epoch: "Cosmos", widthRequired: 9665, minAvgWordLevel: 17.1, realCefr: null, cefrCertified: false, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
  { level: 100, name: "Eternidad V", shortName: "Eternidad", roman: "V", epoch: "Cosmos", widthRequired: 10003, minAvgWordLevel: 17.3, realCefr: "C2", cefrCertified: true, unlockedRarities: ["C", "UC", "R", "SR", "SSR"] },
] as const;

/**
 * Phase 2.18 TASK-052: auto-select tier ratios for battle deck composition.
 * Three-tier priority replaces the old "condition-only" autoselect:
 *   1. Fresh rotation — new words (level < 5) reviewed in last few days.
 *      These carry the most learning value and need repeated exposure early.
 *   2. Overdue review — Worn/Deteriorated, classic SRS catch-up.
 *   3. Power slots — strongest remaining cards, for combat purposes.
 */
export const AUTOSELECT_FRESH_SLOTS_RATIO = 0.35;
export const AUTOSELECT_OVERDUE_SLOTS_RATIO = 0.35;
export const AUTOSELECT_POWER_SLOTS_RATIO = 0.3;
export const AUTOSELECT_FRESH_MAX_LEVEL = 5;
export const AUTOSELECT_FRESH_MAX_AGE_HOURS = 72;

/**
 * Phase 2.18 TASK-052: booster duplicate bias when collection overflows.
 * If the player has more than THRESHOLD words below the learned bar
 * (level < WORD_COLLECTION_WIDTH_LEVEL_THRESHOLD), each booster slot has
 * BIAS_RATIO probability of being a duplicate of an existing word rather
 * than a fresh pool pick. This throttles raw-new-words inflow and gives
 * SRS time to catch up.
 */
export const BOOSTER_DUPLICATE_BIAS_THRESHOLD = 30;
export const BOOSTER_DUPLICATE_BIAS_RATIO = 0.5;

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
