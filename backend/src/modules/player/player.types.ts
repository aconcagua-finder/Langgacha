export type PlayerLevelName =
  | "Beginner"
  | "Elementary"
  | "Intermediate"
  | "Advanced"
  | "Master";

export type PlayerDto = {
  id: string;
  name: string;
  dust: number;
  boosterCount: number;
  nextBoosterAt: string | null;
  dominatedCount: number;
  level: PlayerLevelName;
  nextLevel: PlayerLevelName | null;
  progressToNext: number;
  progressNeeded: number;
  unlockedRarities: string[];
};
