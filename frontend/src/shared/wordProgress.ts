export const WORD_LEVEL_MAX = 30;
export const WORD_EVOLUTION_LEVEL = 15;

export type WordProgressPhase =
  | "new"
  | "learning"
  | "familiar"
  | "confident"
  | "strong"
  | "mastered";

export const getWordProgressPhase = (level: number): WordProgressPhase => {
  if (level >= 26) return "mastered";
  if (level >= 21) return "strong";
  if (level >= 16) return "confident";
  if (level >= 11) return "familiar";
  if (level >= 6) return "learning";
  return "new";
};

export const getWordProgressTheme = (level: number) => {
  switch (getWordProgressPhase(level)) {
    case "learning":
      return {
        bar: "bg-emerald-400",
        badge: "border-emerald-300/30 bg-emerald-400/15 text-emerald-100",
        glow: "ring-emerald-400/25",
      };
    case "familiar":
      return {
        bar: "bg-sky-400",
        badge: "border-sky-300/30 bg-sky-400/15 text-sky-100",
        glow: "ring-sky-400/25",
      };
    case "confident":
      return {
        bar: "bg-violet-400",
        badge: "border-violet-300/30 bg-violet-400/15 text-violet-100",
        glow: "ring-violet-400/25",
      };
    case "strong":
      return {
        bar: "bg-amber-400",
        badge: "border-amber-300/30 bg-amber-400/15 text-amber-100",
        glow: "ring-amber-400/25",
      };
    case "mastered":
      return {
        bar: "bg-yellow-300",
        badge: "border-yellow-300/40 bg-yellow-300/15 text-yellow-100",
        glow: "ring-yellow-300/25",
      };
    default:
      return {
        bar: "bg-slate-300",
        badge: "border-slate-300/20 bg-slate-200/10 text-slate-100",
        glow: "ring-slate-300/20",
      };
  }
};

export const getWordProgressPercent = (wordXp: number, wordXpForNext: number): number => {
  if (wordXpForNext <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round((wordXp / wordXpForNext) * 100)));
};

export const isWordMastered = (level: number): boolean => level >= WORD_LEVEL_MAX;
