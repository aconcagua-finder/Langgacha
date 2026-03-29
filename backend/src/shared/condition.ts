import { WORD_LEVEL_MAX, WORD_REVIEW_INTERVAL_DAYS, clamp } from "./constants.js";

export type ComputedCondition = "Brilliant" | "Normal" | "Worn" | "Deteriorated";

export function computeConditionFromReview(
  lastReviewedAt: Date | string | null,
  wordLevel: number = 0,
): ComputedCondition {
  if (!lastReviewedAt) return "Normal";

  const daysSinceReview =
    (Date.now() - new Date(lastReviewedAt).getTime()) / (1000 * 60 * 60 * 24);
  const boundedLevel = clamp(wordLevel, 0, WORD_LEVEL_MAX);
  const interval = WORD_REVIEW_INTERVAL_DAYS[boundedLevel] ?? 1;
  const ratio = daysSinceReview / interval;

  if (ratio < 0.5) return "Brilliant";
  if (ratio < 1) return "Normal";
  if (ratio < 2) return "Worn";
  return "Deteriorated";
}
