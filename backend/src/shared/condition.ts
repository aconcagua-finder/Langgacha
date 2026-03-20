export function computeCondition(card: { condition: string; lastUsedAt: Date }): string {
  const now = Date.now();
  const last = new Date(card.lastUsedAt).getTime();
  const daysSinceUse = (now - last) / (1000 * 60 * 60 * 24);

  if (daysSinceUse >= 7) return "Deteriorada";
  if (daysSinceUse >= 3) return "Gastada";
  return card.condition;
}

export function improveCondition(current: string): string {
  if (current === "Deteriorada") return "Gastada";
  if (current === "Gastada") return "Normal";
  if (current === "Normal") return "Brillante";
  return current;
}

