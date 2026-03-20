import type { GeneratedCardDto } from "../cards/cards.types.js";

export type CraftResult = {
  card: GeneratedCardDto;
  dustSpent: number;
  dustRemaining: number;
  nextCraftAt: string;
};

export type CraftStatus = {
  available: boolean;
  nextCraftAt: string | null;
  costs: Record<string, number>;
};

