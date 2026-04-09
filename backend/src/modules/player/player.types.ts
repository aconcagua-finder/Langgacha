export type PlayerCollectionLevelName = "A1" | "A1+" | "A2" | "A2+" | "B1" | "B1+";

export type PlayerDto = {
  id: string;
  name: string;
  dust: number;
  boosterCount: number;
  nextBoosterAt: string | null;
  craftAvailable: boolean;
  nextCraftAt: string | null;
  pityCounter: number;
  collectionLevel: PlayerCollectionLevelName;
  collectionGachaName: string;
  nextCollectionLevel: PlayerCollectionLevelName | null;
  wordsWidth: number;
  wordsWidthNeeded: number;
  avgWordLevel: number;
  avgWordLevelNeeded: number;
  totalCollectionXp: number;
  unlockedRarities: string[];
  /**
   * Theme keys available to the player based on CEFR max level.
   * Phase 2.18: all themes with cefrTier <= player's cefrMax.
   */
  unlockedThemes: string[];
  /** Effective CEFR max level for booster/content filtering. */
  cefrMaxLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
};
