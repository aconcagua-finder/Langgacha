import type { GeneratedCardDto } from "../cards/cards.types.js";
import type { Quiz, QuizPublic } from "../quiz/quiz.types.js";

export type BattleCard = {
  id: string;
  wordId: string;
  conceptKey?: string | null;
  word: string;
  translationRu: string;
  type: string;
  rarity: string;
  atk: number;
  def: number;
  hp: number;
  condition: string;
  quiz: Quiz;
};

export type BattleCardPublic = Omit<BattleCard, "wordId" | "translationRu" | "quiz"> & {
  quiz: QuizPublic;
};

export type BattleCardResult = Omit<BattleCard, "wordId" | "quiz"> & {
  quiz: QuizPublic;
};

export type CombatTick = {
  attacker: "player" | "bot";
  damage: number;
  targetHpAfter: number;
};

export type RoundResult = {
  roundNumber: number;
  playerCard: BattleCardResult;
  botCard: BattleCardResult;
  quizCorrect: boolean;
  correctAnswer: string;
  inspirationApplied: boolean;
  combatLog: CombatTick[];
  winner: "player" | "bot";
  survivorHpLeft: number;
};

export type BattleRewards = {
  dust: number;
  bonusCard: GeneratedCardDto | null;
  correctAnswers: number;
  streak: number;
  wordXpGains: WordXpGain[];
};

export type WordXpGain = {
  wordId: string;
  word: string;
  xpGained: number;
  oldLevel: number;
  newLevel: number;
  leveledUp: boolean;
  xpInCurrentLevel: number;
  xpForNextLevel: number;
};

export type BattleResult = {
  id: string;
  rounds: RoundResult[];
  winner: "player" | "bot";
  playerWins: number;
  botWins: number;
  rewards: BattleRewards;
};

export type BattleStartRound = {
  roundNumber: number;
  playerCard: BattleCardPublic;
  botCard: BattleCardPublic;
  quiz: QuizPublic;
};

export type BattleStartResponse = {
  battleId: string;
  playerCards: BattleCardPublic[];
  botCards: BattleCardPublic[];
  rounds: BattleStartRound[];
};

export type BattleAnswerResponse = {
  round: RoundResult;
  battleResult?: BattleResult;
};

export type BattleState = {
  id: string;
  playerId: string;
  playerCards: BattleCard[];
  botCards: BattleCard[];
  playerPos: number;
  botPos: number;
  currentRound: number;
  playerWins: number;
  botWins: number;
  rounds: RoundResult[];
  correctStreak: number;
  maxStreak: number;
  totalCorrect: number;
  dustFromAnswers: number;
  defeatedBotRarities: string[];
  wordXpGains: WordXpGain[];
};
