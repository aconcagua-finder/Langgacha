import type { GeneratedCard } from "../types/card";

import { API_URL } from "./config";

export type CraftStatus = {
  available: boolean;
  nextCraftAt: string | null;
  costs: Record<string, number>;
};

export type CraftResult = {
  card: GeneratedCard;
  dustSpent: number;
  dustRemaining: number;
  nextCraftAt: string;
};

const errorMessage = async (res: Response): Promise<string> => {
  try {
    const data = (await res.json()) as { message?: string };
    if (data?.message) return data.message;
  } catch {
    // ignore
  }
  return `Request failed: ${res.status}`;
};

export const getCraftStatus = async (): Promise<CraftStatus> => {
  const res = await fetch(`${API_URL}/api/craft/status`);
  if (!res.ok) throw new Error(await errorMessage(res));
  return (await res.json()) as CraftStatus;
};

export const craftCard = async (rarity: string): Promise<CraftResult> => {
  const res = await fetch(`${API_URL}/api/craft`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rarity }),
  });
  if (!res.ok) throw new Error(await errorMessage(res));
  return (await res.json()) as CraftResult;
};

