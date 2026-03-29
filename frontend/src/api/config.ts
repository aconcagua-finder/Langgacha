import { apiFetch } from "./fetcher";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type GameConfig = {
  rarityOrder: string[];
  rarityChances: Record<string, number>;
  conditionModifiers: Record<string, number>;
  inspirationBonus: number;
  streakThreshold: number;
  streakMultiplier: number;
  defScalingFactor: number;
  battleDeckSize: number;
  maxBoosters: number;
  boosterRechargeMs: number;
  boosterSize: number;
  pityThreshold: number;
  raidMaxCards: number;
  raidVictoryDust: number;
  raidVictoryBoosters: number;
  dustPerDisintegrate: Record<string, number>;
  dustPerCraft: Record<string, number>;
  craftsPerDay: number;
  wordLevelMax: number;
  wordEvolutionLevel: number;
  wordCollectionWidthLevelThreshold: number;
  collectionLevels: Array<{
    name: string;
    gachaName: string;
    minWords: number;
    minAvgLevel: number;
    rarities: string[];
  }>;
};

export const fetchConfig = async (): Promise<GameConfig> => {
  const res = await apiFetch("/api/config");
  if (!res.ok) throw new Error(`Failed to fetch config: ${res.status}`);
  return (await res.json()) as GameConfig;
};
