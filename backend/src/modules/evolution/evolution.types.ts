import type { GeneratedCardDto } from "../cards/cards.types.js";

export type EvolutionStatus = {
  cardId: string;
  canEvolve: boolean;
  reason: string | null;
  masteryProgress: number;
  requiredMastery: number;
  dustCost: number;
  dustAvailable: number;
  enoughDust: boolean;
  wordCanEvolve: boolean;
  isEvolved: boolean;
};

export type EvolveResult = {
  card: GeneratedCardDto;
  dustSpent: number;
  dustRemaining: number;
};
