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
};
