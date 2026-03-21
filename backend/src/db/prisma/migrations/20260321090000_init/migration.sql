-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Word" (
    "id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "translationRu" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "baseFue" INTEGER NOT NULL,
    "baseDef" INTEGER NOT NULL,
    "colorido" INTEGER NOT NULL,
    "flavorText" TEXT NOT NULL,
    "hint" TEXT NOT NULL,
    "tags" TEXT[],
    "canEvolve" BOOLEAN NOT NULL DEFAULT false,
    "imagePrompt" TEXT,
    "quizCorrect" TEXT NOT NULL,
    "quizOptions" TEXT[],
    "evolutionData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "fue" INTEGER NOT NULL,
    "def" INTEGER NOT NULL,
    "masteryProgress" INTEGER NOT NULL DEFAULT 0,
    "condition" TEXT NOT NULL DEFAULT 'Normal',
    "isEvolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "playerId" TEXT,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Player',
    "polvo" INTEGER NOT NULL DEFAULT 0,
    "boosterCount" INTEGER NOT NULL DEFAULT 7,
    "lastBoosterAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastCraftAt" TIMESTAMP(3),
    "pityCounter" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RaidDay" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "bossWord" TEXT NOT NULL,
    "bossHp" INTEGER NOT NULL,
    "currentHp" INTEGER NOT NULL,
    "bossAtk" INTEGER NOT NULL,
    "bossDef" INTEGER NOT NULL,
    "bossRarity" TEXT NOT NULL,
    "bossType" TEXT NOT NULL,
    "bossFlavorText" TEXT NOT NULL DEFAULT '',
    "defeated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RaidDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RaidAttack" (
    "id" TEXT NOT NULL,
    "raidDayId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "damage" INTEGER NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RaidAttack_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Word_language_word_key" ON "Word"("language", "word");

-- CreateIndex
CREATE UNIQUE INDEX "Player_userId_key" ON "Player"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "RaidDay_date_key" ON "RaidDay"("date");

-- CreateIndex
CREATE UNIQUE INDEX "RaidAttack_raidDayId_playerId_cardId_key" ON "RaidAttack"("raidDayId", "playerId", "cardId");

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaidAttack" ADD CONSTRAINT "RaidAttack_raidDayId_fkey" FOREIGN KEY ("raidDayId") REFERENCES "RaidDay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaidAttack" ADD CONSTRAINT "RaidAttack_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaidAttack" ADD CONSTRAINT "RaidAttack_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

