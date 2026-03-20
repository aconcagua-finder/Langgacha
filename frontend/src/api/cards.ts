import type { GeneratedCard } from "../types/card";

import { API_URL } from "./config";

export type ListCardsSort = "newest" | "atk_desc" | "def_desc" | "rarity_desc";

export type ListCardsParams = {
  type?: string[];
  rarity?: string[];
  sort?: ListCardsSort;
};

export const generateCard = async (): Promise<GeneratedCard> => {
  const res = await fetch(`${API_URL}/api/cards/generate`, { method: "POST" });
  if (!res.ok) throw new Error(`Failed to generate card: ${res.status}`);
  return (await res.json()) as GeneratedCard;
};

export const listCards = async (params: ListCardsParams = {}): Promise<GeneratedCard[]> => {
  const search = new URLSearchParams();
  if (params.type?.length) search.set("type", params.type.join(","));
  if (params.rarity?.length) search.set("rarity", params.rarity.join(","));
  if (params.sort) search.set("sort", params.sort);

  const qs = search.toString();
  const url = `${API_URL}/api/cards${qs ? `?${qs}` : ""}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to list cards: ${res.status}`);
  return (await res.json()) as GeneratedCard[];
};

export const disintegrateCard = async (
  cardId: string,
): Promise<{ dustGained: number; totalDust: number }> => {
  const res = await fetch(`${API_URL}/api/cards/${cardId}/disintegrate`, { method: "POST" });
  if (!res.ok) throw new Error(`Failed to disintegrate card: ${res.status}`);
  return (await res.json()) as { dustGained: number; totalDust: number };
};
