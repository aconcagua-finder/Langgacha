import type { GeneratedCard } from "../types/card";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

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

