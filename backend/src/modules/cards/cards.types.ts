export type CardCondition = "Brilliant" | "Normal" | "Worn" | "Deteriorated";

export type GeneratedCardDto = {
  id: string;
  word: string;
  translationRu: string;
  type: string;
  rarity: string;
  atk: number;
  def: number;
  colorido: number;
  flavorText: string;
  hint: string;
  tags: string[];
  condition: CardCondition;
  masteryProgress: number;
  canEvolve: boolean;
};
