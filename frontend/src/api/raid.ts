import type { GeneratedCard } from "../types/card";
import type { QuizData } from "../types/quiz";

import { API_URL } from "./config";
import { apiFetch } from "./fetcher";

export type RaidStatus = {
  id: string;
  date: string;
  bossWord: string;
  bossHp: number;
  currentHp: number;
  bossAtk: number;
  bossDef: number;
  bossRarity: string;
  bossType: string;
  bossFlavorText: string;
  defeated: boolean;
  totalCards: number;
  usedCards: number;
  playerDamage: number;
};

export type NextRaidCard = {
  card: GeneratedCard;
  quiz: QuizData;
};

export type RaidAttackResult = {
  correct: boolean;
  inspirationApplied: boolean;
  cardHp: number;
  cardFinalHp: number;
  bossHpBefore: number;
  bossCurrentHp: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  rounds: number;
  cardSurvived: boolean;
  bossDefeated: boolean;
  dustEarned: number;
  victoryDust?: number;
  victoryBoosters?: number;
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

export const getRaidStatus = async (): Promise<RaidStatus> => {
  const res = await apiFetch(`${API_URL}/api/raid`);
  if (!res.ok) throw new Error(await errorMessage(res));
  return (await res.json()) as RaidStatus;
};

export const getNextRaidCard = async (): Promise<NextRaidCard | null> => {
  const res = await apiFetch(`${API_URL}/api/raid/next-card`);
  if (!res.ok) throw new Error(await errorMessage(res));
  return (await res.json()) as NextRaidCard | null;
};

export const attackRaidBoss = async (
  cardId: string,
  answer: string,
): Promise<RaidAttackResult> => {
  const res = await apiFetch(`${API_URL}/api/raid/attack`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cardId, answer }),
  });
  if (!res.ok) throw new Error(await errorMessage(res));
  return (await res.json()) as RaidAttackResult;
};
