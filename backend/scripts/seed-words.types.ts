export type WordType = "Person" | "Place" | "Action" | "Object" | "Emotion" | "Expression";
export type WordRarity = "C" | "UC" | "R" | "SR";

export type SeedWord = {
  language: "es";
  conceptKey: string;
  word: string;
  translationRu: string;
  type: WordType;
  rarity: WordRarity;
  baseAtk: number;
  baseDef: number;
  colorido: number;
  flavorText: string;
  hint: string;
  tags: string[];
  canEvolve?: boolean;
  imagePrompt?: string | null;
  quizCorrect: string;
  quizOptions: [string, string, string, string];
  evolutionData?: unknown | null;
};

