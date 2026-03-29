import type { GeneratedCard } from "../types/card";

import { API_URL } from "./config";
import { apiFetch } from "./fetcher";

export type EvolutionStatus = {
  cardId: string;
  canEvolve: boolean;
  reason: string | null;
  wordLevel: number;
  requiredWordLevel: number;
  dustCost: number;
  dustAvailable: number;
  enoughDust: boolean;
  wordCanEvolve: boolean;
  isEvolved: boolean;
};

export type EvolveResult = {
  card: GeneratedCard;
  dustSpent: number;
  dustRemaining: number;
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

export const getEvolutionStatus = async (cardId: string): Promise<EvolutionStatus> => {
  const res = await apiFetch(`${API_URL}/api/evolution/status/${cardId}`);
  if (!res.ok) throw new Error(await errorMessage(res));
  return (await res.json()) as EvolutionStatus;
};

export const evolveCard = async (cardId: string): Promise<EvolveResult> => {
  const res = await apiFetch(`${API_URL}/api/evolution/evolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cardId }),
  });
  if (!res.ok) throw new Error(await errorMessage(res));
  return (await res.json()) as EvolveResult;
};
