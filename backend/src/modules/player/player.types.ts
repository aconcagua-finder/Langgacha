export type PlayerLevelName =
  | "Principiante"
  | "Elemental"
  | "Intermedio"
  | "Avanzado"
  | "Maestro";

export type PlayerDto = {
  id: string;
  name: string;
  polvo: number;
  dominatedCount: number;
  level: PlayerLevelName;
  nextLevel: PlayerLevelName | null;
  progressToNext: number;
  progressNeeded: number;
  unlockedRarities: string[];
};

