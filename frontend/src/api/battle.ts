import { API_URL } from "./config";
import type { GeneratedCard } from "../types/card";

export type BattleCardPublic = {
  id: string;
  word: string;
  type: string;
  rarity: string;
  fue: number;
  def: number;
  hp: number;
  condition: string;
  quizOptions: string[];
};

export type BattleStartResponse = {
  battleId: string;
  playerCards: BattleCardPublic[];
  botCards: BattleCardPublic[];
  rounds: Array<{
    roundNumber: number;
    playerCard: BattleCardPublic;
    botCard: BattleCardPublic;
    quiz: { question: string; options: string[] };
  }>;
};

export type CombatTick = {
  attacker: "player" | "bot";
  damage: number;
  targetHpAfter: number;
};

export type BattleCardRound = BattleCardPublic & { translationRu: string };

export type RoundResult = {
  roundNumber: number;
  playerCard: BattleCardRound;
  botCard: BattleCardRound;
  quizCorrect: boolean;
  inspiracionApplied: boolean;
  combatLog: CombatTick[];
  winner: "player" | "bot";
  survivorHpLeft: number;
};

export type BattleRewards = {
  polvo: number;
  bonusCard: GeneratedCard | null;
  correctAnswers: number;
  streak: number;
};

export type BattleResult = {
  id: string;
  rounds: RoundResult[];
  winner: "player" | "bot";
  rewards: BattleRewards;
};

export type BattleAnswerResponse = {
  round: RoundResult;
  battleResult?: BattleResult;
};

export const startBattle = async (cardIds: string[]): Promise<BattleStartResponse> => {
  const res = await fetch(`${API_URL}/api/battle/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cardIds }),
  });
  if (!res.ok) throw new Error(`Failed to start battle: ${res.status}`);
  return (await res.json()) as BattleStartResponse;
};

export const answerBattle = async (params: {
  battleId: string;
  roundNumber: number;
  answer: string;
}): Promise<BattleAnswerResponse> => {
  const res = await fetch(`${API_URL}/api/battle/${params.battleId}/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roundNumber: params.roundNumber, answer: params.answer }),
  });
  if (!res.ok) throw new Error(`Failed to answer round: ${res.status}`);
  return (await res.json()) as BattleAnswerResponse;
};
