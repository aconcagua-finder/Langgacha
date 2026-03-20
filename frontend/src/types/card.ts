export type CardCondition = "Brilliant" | "Normal" | "Worn" | "Deteriorated";

export type GeneratedCard = {
  id: string;
  word: string;
  translationRu: string;
  type: string;
  rarity: string;
  fue: number;
  def: number;
  colorido: number;
  flavorText: string;
  hint: string;
  tags: string[];
  condition: CardCondition;
  masteryProgress: number;
  canEvolve: boolean;
};
