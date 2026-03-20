import { API_URL } from "./config";
import { apiFetch } from "./fetcher";

export type PlayerDto = {
  id: string;
  name: string;
  dust: number;
  boosterCount: number;
  nextBoosterAt: string | null;
  craftAvailable: boolean;
  nextCraftAt: string | null;
  pityCounter: number;
  dominatedCount: number;
  level: string;
  nextLevel: string | null;
  progressToNext: number;
  progressNeeded: number;
  unlockedRarities: string[];
};

export const getPlayer = async (): Promise<PlayerDto> => {
  const res = await apiFetch(`${API_URL}/api/player`);
  if (!res.ok) throw new Error(`Failed to fetch player: ${res.status}`);
  return (await res.json()) as PlayerDto;
};
