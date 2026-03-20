import type { GeneratedCardDto } from "../cards/cards.types.js";

export type BattleCard = {
  id: string;
  word: string;
  translationRu: string;
  type: string;
  rarity: string;
  fue: number;
  def: number;
  hp: number;
  condition: string;
  quizCorrect: string;
  quizOptions: string[];
};

export type BattleCardPublic = Omit<BattleCard, "quizCorrect" | "translationRu">;

export type CombatTick = {
  attacker: "player" | "bot";
  damage: number;
  targetHpAfter: number;
};

export type RoundResult = {
  roundNumber: number;
  playerCard: Omit<BattleCard, "quizCorrect">;
  botCard: Omit<BattleCard, "quizCorrect">;
  quizCorrect: boolean;
  inspiracionApplied: boolean;
  combatLog: CombatTick[];
  winner: "player" | "bot";
  survivorHpLeft: number;
};

export type BattleRewards = {
  polvo: number;
  bonusCard: GeneratedCardDto | null;
  correctAnswers: number;
  streak: number;
};

export type BattleResult = {
  id: string;
  rounds: RoundResult[];
  winner: "player" | "bot";
  rewards: BattleRewards;
};

export type BattleStartRound = {
  roundNumber: number;
  playerCard: BattleCardPublic;
  botCard: BattleCardPublic;
  quiz: {
    question: string;
    options: string[];
  };
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
  playerCards: BattleCard[];
  botCards: BattleCard[];
  playerPos: number;
  botPos: number;
  playerHpLeft: number;
  botHpLeft: number;
  currentRound: number;
  rounds: RoundResult[];
  correctStreak: number;
  maxStreak: number;
  totalCorrect: number;
  polvoFromAnswers: number;
  defeatedBotRarities: string[];
};

