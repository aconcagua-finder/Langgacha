import type { GeneratedCardDto } from "../cards/cards.types.js";
import type { QuizPublic } from "../quiz/quiz.types.js";

export type RaidStatus = {
  id: string;
  date: string;
  bossWord: string;
  bossTranslationRu: string;
  bossHp: number;
  currentHp: number;
  bossAtk: number;
  bossDef: number;
  bossRarity: string;
  bossType: string;
  bossFlavorText: string;
  defeated: boolean;
  totalCards: number;
  usedCards: number;
  playerDamage: number;
};

export type NextRaidCard = {
  card: GeneratedCardDto;
  quiz: QuizPublic;
};

export type RaidWordXpGain = {
  wordId: string;
  word: string;
  xpGained: number;
  oldLevel: number;
  newLevel: number;
  leveledUp: boolean;
  xpInCurrentLevel: number;
  xpForNextLevel: number;
};

export type RaidAttackResult = {
  correct: boolean;
  inspirationApplied: boolean;
  cardHp: number;
  cardFinalHp: number;
  bossHpBefore: number;
  bossCurrentHp: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  rounds: number;
  cardSurvived: boolean;
  bossDefeated: boolean;
  dustEarned: number;
  wordXpGain: RaidWordXpGain | null;
  victoryDust?: number;
  victoryBoosters?: number;
};
