import type { GeneratedCardDto } from "../cards/cards.types.js";

export type BoosterInfoDto = {
  count: number;
  maxBoosters: number;
  nextRechargeAt: string | null;
};

export type OpenBoosterResponse = {
  cards: GeneratedCardDto[];
  boosterInfo: BoosterInfoDto;
};
