import { API_URL } from "./config";
import { apiFetch } from "./fetcher";

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type ThemeProgressStatus = "Locked" | "InProgress" | "Learned" | "Mastered";

export type ThemeProgressDto = {
  themeKey: string;
  themeName: string;
  themeNameEs: string;
  emoji: string | null;
  domain: string;
  cefrTier: CefrLevel;
  wordsTotal: number;
  wordsLearned: number;
  wordsMastered: number;
  percentLearned: number;
  percentMastered: number;
  status: ThemeProgressStatus;
};

export type CollectionRealCefrCoverage = {
  nextAnchor: CefrLevel | null;
  nextAnchorWidth: number;
  percentToNextAnchor: number;
  lastAchievedCefr: CefrLevel | null;
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

  // 100-level collection progression (Phase 2.18 TASK-052)
  collectionLevel: number;
  collectionLevelName: string;
  collectionLevelShort: string;
  collectionLevelRoman: string;
  collectionLevelEpoch: string;
  collectionLevelCefrCertified: boolean;
  collectionLevelRealCefr: CefrLevel | null;

  nextLevelName: string | null;
  nextLevelWidth: number;
  nextLevelMinAvg: number;

  cefrCoverage: CollectionRealCefrCoverage;

  wordsWidth: number;
  widthRequired: number;
  avgWordLevel: number;
  minAvgLevel: number;
  totalCollectionXp: number;

  unlockedRarities: string[];
  unlockedThemes: string[];
  cefrMaxLevel: CefrLevel;
  themeProgress: ThemeProgressDto[];
};

export const getPlayer = async (): Promise<PlayerDto> => {
  const res = await apiFetch(`${API_URL}/api/player`);
  if (!res.ok) throw new Error(`Failed to fetch player: ${res.status}`);
  return (await res.json()) as PlayerDto;
};
