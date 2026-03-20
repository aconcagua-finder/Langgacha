export type RaidStatus = {
  id: string;
  date: string;
  bossWord: string;
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
  card: {
    id: string;
    word: string;
    translationRu: string;
    type: string;
    rarity: string;
    atk: number;
    def: number;
    colorido: number;
    flavorText: string;
    hint: string;
    tags: string[];
    condition: string;
    masteryProgress: number;
    canEvolve: boolean;
  };
  quiz: {
    question: string;
    options: string[];
  };
};

export type RaidAttackResult = {
  damage: number;
  correct: boolean;
  inspirationApplied: boolean;
  bossCurrentHp: number;
  bossDefeated: boolean;
  dustEarned: number;
  victoryDust?: number;
  victoryBoosters?: number;
};

