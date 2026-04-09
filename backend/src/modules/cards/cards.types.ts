export type CardCondition = "Brilliant" | "Normal" | "Worn" | "Deteriorated";

export type GeneratedCardDto = {
  id: string;
  conceptKey?: string | null;
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
  wordLevel: number;
  wordXp: number;
  wordXpForNext: number;
  canEvolve: boolean;
  isEvolved: boolean;

  // Phase 2.18 Content Foundation fields
  cefrLevel: string | null;
  isCore: boolean;
  themes: string[];        // all theme keys (primary + additional)
  primaryTheme: string | null;
};
