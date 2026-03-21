export type ComputedCondition = "Brilliant" | "Normal" | "Worn" | "Deteriorated";

export function computeConditionFromReview(
  lastReviewedAt: Date | string | null,
): ComputedCondition {
  if (!lastReviewedAt) return "Deteriorated";

  const daysSinceReview =
    (Date.now() - new Date(lastReviewedAt).getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceReview >= 7) return "Deteriorated";
  if (daysSinceReview >= 3) return "Worn";
  if (daysSinceReview < 1) return "Brilliant";
  return "Normal";
}
