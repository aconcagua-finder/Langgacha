export type WordType = "Person" | "Place" | "Action" | "Object" | "Emotion" | "Expression";
export type WordRarity = "C" | "UC" | "R" | "SR" | "SSR";
export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

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

  // Phase 2.18 Content Foundation fields.
  // NOTE: legacy seed-words-{common,uncommon,rare,sr}.ts don't populate these inline;
  // seed.ts resolves them from seed-words-taxonomy.ts by conceptKey at seed time.
  // New files (seed-words-core.ts, seed-theme-*.ts) populate them directly.
  cefrLevel?: CefrLevel;
  isCore?: boolean;
  /**
   * Theme keys in order: first = primary, rest = additional.
   * Empty array for isCore=true words.
   * Must match keys from scripts/seed-themes.ts THEMES.
   */
  themes?: string[];
  dialect?: "rioplatense" | "castellano"; // default rioplatense
};

