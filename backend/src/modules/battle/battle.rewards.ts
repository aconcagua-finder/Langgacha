import {
  BONUS_CARD_CHANCE,
  CORRECT_ANSWER_DUST,
  DUST_PER_RARITY_BATTLE,
  STREAK_MULTIPLIER,
  STREAK_THRESHOLD,
} from "../../shared/constants.js";

export const applyAnswerReward = (params: {
  correctStreak: number;
}): number => {
  const multiplier = params.correctStreak >= STREAK_THRESHOLD ? STREAK_MULTIPLIER : 1;
  return Math.round(CORRECT_ANSWER_DUST * multiplier);
};

export const dustForDefeatedBot = (rarity: string): number =>
  DUST_PER_RARITY_BATTLE[rarity] ?? 0;

export const shouldDropBonusCard = (): boolean => Math.random() < BONUS_CARD_CHANCE;
