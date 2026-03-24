import type { FastifyPluginAsync } from "fastify";

import {
  BATTLE_DECK_SIZE,
  BOOSTER_RECHARGE_MS,
  BOOSTER_SIZE,
  CONDITION_MODIFIERS,
  CRAFTS_PER_DAY,
  DEF_SCALING_FACTOR,
  DUST_PER_CRAFT,
  DUST_PER_DISINTEGRATE,
  INSPIRATION_BONUS,
  MASTERY_MAX,
  MAX_BOOSTERS,
  PITY_THRESHOLD,
  PROGRESSION_LEVELS,
  RAID_MAX_CARDS,
  RAID_VICTORY_BOOSTERS,
  RAID_VICTORY_DUST,
  RARITY_CHANCES,
  RARITY_ORDER,
  STREAK_MULTIPLIER,
  STREAK_THRESHOLD,
} from "../../shared/constants.js";

export const configRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async () => {
    return {
      rarityOrder: RARITY_ORDER,
      rarityChances: RARITY_CHANCES,
      conditionModifiers: CONDITION_MODIFIERS,
      inspirationBonus: INSPIRATION_BONUS,
      streakThreshold: STREAK_THRESHOLD,
      streakMultiplier: STREAK_MULTIPLIER,
      defScalingFactor: DEF_SCALING_FACTOR,
      battleDeckSize: BATTLE_DECK_SIZE,
      maxBoosters: MAX_BOOSTERS,
      boosterRechargeMs: BOOSTER_RECHARGE_MS,
      boosterSize: BOOSTER_SIZE,
      pityThreshold: PITY_THRESHOLD,
      raidMaxCards: RAID_MAX_CARDS,
      raidVictoryDust: RAID_VICTORY_DUST,
      raidVictoryBoosters: RAID_VICTORY_BOOSTERS,
      dustPerDisintegrate: DUST_PER_DISINTEGRATE,
      dustPerCraft: DUST_PER_CRAFT,
      craftsPerDay: CRAFTS_PER_DAY,
      masteryMax: MASTERY_MAX,
      progressionLevels: PROGRESSION_LEVELS,
    };
  });
};
