import type { GeneratedCard } from "../types/card";

import { API_URL } from "./config";

export const generateCard = async (): Promise<GeneratedCard> => {
  const res = await fetch(`${API_URL}/api/cards/generate`, { method: "POST" });
  if (!res.ok) throw new Error(`Failed to generate card: ${res.status}`);
  return (await res.json()) as GeneratedCard;
};

export const listCards = async (): Promise<GeneratedCard[]> => {
  const res = await fetch(`${API_URL}/api/cards`);
  if (!res.ok) throw new Error(`Failed to list cards: ${res.status}`);
  return (await res.json()) as GeneratedCard[];
};
