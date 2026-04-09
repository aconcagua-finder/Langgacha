/**
 * Phase 2.18 TASK-052: PlayerDto rebuilt for 100-level collection ladder.
 *
 * Old single-letter "A1/A2/B1+" level name is gone — replaced by numeric level
 * (1-100) plus rich metadata (rank name, epoch, CEFR anchor info).
 */

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type ThemeProgressStatus = "Locked" | "InProgress" | "Learned" | "Mastered";

export type ThemeProgressDto = {
  themeKey: string;
  themeName: string;        // nameRu
  themeNameEs: string;      // nameEs
  emoji: string | null;
  domain: string;
  cefrTier: CefrLevel;
  wordsTotal: number;
  wordsLearned: number;     // level >= WORD_COLLECTION_WIDTH_LEVEL_THRESHOLD (5)
  wordsMastered: number;    // level >= 10
  percentLearned: number;   // 0-100
  percentMastered: number;  // 0-100
  status: ThemeProgressStatus;
};

export type CollectionRealCefrCoverage = {
  nextAnchor: CefrLevel | null;    // nearest future CEFR anchor
  nextAnchorWidth: number;         // words to reach it
  percentToNextAnchor: number;     // 0-100 toward next anchor
  lastAchievedCefr: CefrLevel | null;  // most recent anchor passed (if any)
};

export type PlayerDto = {
  id: string;
  name: string;
  dust: number;
  boosterCount: number;
  nextBoosterAt: string | null;
  craftAvailable: boolean;
  nextCraftAt: string | null;
  pityCounter: number;

  // 100-level collection progression
  collectionLevel: number;              // 1..100
  collectionLevelName: string;          // "Oro V"
  collectionLevelShort: string;         // "Oro"
  collectionLevelRoman: string;         // "V"
  collectionLevelEpoch: string;         // "Metales" | "Piedras" | "Cosmos"
  collectionLevelCefrCertified: boolean;
  collectionLevelRealCefr: CefrLevel | null;  // non-null only on certified tiers

  // Next-level target
  nextLevelName: string | null;
  nextLevelWidth: number;               // width needed for the next level up
  nextLevelMinAvg: number;              // min avg word level needed for the next level up

  // Real CEFR coverage (honest "% of real A1/A2/..." bar)
  cefrCoverage: CollectionRealCefrCoverage;

  // Width & depth metrics
  wordsWidth: number;                   // words with level >= threshold
  widthRequired: number;                // width required by CURRENT level (for progress bar)
  avgWordLevel: number;                 // average level of qualified words
  minAvgLevel: number;                  // min avg required by CURRENT level
  totalCollectionXp: number;

  // Unlocked content
  unlockedRarities: string[];
  unlockedThemes: string[];
  cefrMaxLevel: CefrLevel;

  // Theme layer
  themeProgress: ThemeProgressDto[];
};
