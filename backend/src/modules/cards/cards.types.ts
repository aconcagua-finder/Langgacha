export type CardCondition = "Brillante" | "Normal" | "Gastada" | "Deteriorada";

export type GeneratedCardDto = {
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

