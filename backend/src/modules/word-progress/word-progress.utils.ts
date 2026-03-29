import { clamp, WORD_LEVEL_MAX, WORD_XP_PER_LEVEL } from "../../shared/constants.js";

export type WordLevelProgress = {
  level: number;
  xpInCurrentLevel: number;
  xpForNextLevel: number;
};

export const getWordLevelStartXp = (level: number): number => {
  const boundedLevel = clamp(level, 0, WORD_LEVEL_MAX);
  let total = 0;
  for (let currentLevel = 1; currentLevel <= boundedLevel; currentLevel += 1) {
    total += WORD_XP_PER_LEVEL[currentLevel] ?? 0;
  }
  return total;
};

export const getWordMaxXp = (): number => getWordLevelStartXp(WORD_LEVEL_MAX);

export const clampWordXp = (xp: number): number => clamp(Math.max(0, xp), 0, getWordMaxXp());

export const calculateLevelFromXp = (totalXp: number): WordLevelProgress => {
  const xp = clampWordXp(totalXp);
  let remaining = xp;

  for (let level = 1; level <= WORD_LEVEL_MAX; level += 1) {
    const needed = WORD_XP_PER_LEVEL[level] ?? 0;
    if (remaining < needed) {
      return {
        level: level - 1,
        xpInCurrentLevel: remaining,
        xpForNextLevel: needed,
      };
    }
    remaining -= needed;
  }

  return {
    level: WORD_LEVEL_MAX,
    xpInCurrentLevel: 0,
    xpForNextLevel: 0,
  };
};
