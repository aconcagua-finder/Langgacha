import type { GeneratedCard } from "../types/card";
import { API_URL } from "./config";
import { apiFetch } from "./fetcher";

export type BoosterInfo = {
  count: number;
  maxBoosters: number;
  nextRechargeAt: string | null;
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

export const getBoosterStatus = async (): Promise<BoosterInfo> => {
  const res = await apiFetch(`${API_URL}/api/boosters/status`);
  if (!res.ok) throw new Error(await errorMessage(res));
  return (await res.json()) as BoosterInfo;
};

export const openBooster = async (): Promise<{
  cards: GeneratedCard[];
  boosterInfo: BoosterInfo;
}> => {
  const res = await apiFetch(`${API_URL}/api/boosters/open`, { method: "POST" });
  if (!res.ok) throw new Error(await errorMessage(res));
  return (await res.json()) as { cards: GeneratedCard[]; boosterInfo: BoosterInfo };
};
