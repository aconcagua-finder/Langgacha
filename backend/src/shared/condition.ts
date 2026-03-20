export function computeCondition(card: { condition: string; lastUsedAt: Date }): string {
  const now = Date.now();
  const last = new Date(card.lastUsedAt).getTime();
  const daysSinceUse = (now - last) / (1000 * 60 * 60 * 24);

  if (daysSinceUse >= 7) return "Deteriorated";
  if (daysSinceUse >= 3) return "Worn";
  return normalizeCondition(card.condition);
}

const normalizeCondition = (condition: string): string => {
  if (condition === "Brillante") return "Brilliant";
  if (condition === "Gastada") return "Worn";
  if (condition === "Deteriorada") return "Deteriorated";
  return condition;
};

export function improveCondition(current: string): string {
  const normalized = normalizeCondition(current);
  if (normalized === "Deteriorated") return "Worn";
  if (normalized === "Worn") return "Normal";
  if (normalized === "Normal") return "Brilliant";
  return normalized;
}
