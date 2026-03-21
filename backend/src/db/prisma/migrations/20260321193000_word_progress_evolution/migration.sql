CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- CreateTable
CREATE TABLE "WordProgress" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "masteryProgress" INTEGER NOT NULL DEFAULT 0,
    "lastReviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WordProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WordProgress_playerId_wordId_key" ON "WordProgress"("playerId", "wordId");

-- Backfill
INSERT INTO "WordProgress" ("id", "playerId", "wordId", "masteryProgress", "lastReviewedAt")
SELECT
  gen_random_uuid()::text,
  c."playerId",
  c."wordId",
  MAX(c."masteryProgress"),
  MAX(c."lastUsedAt")
FROM "Card" c
WHERE c."playerId" IS NOT NULL
GROUP BY c."playerId", c."wordId"
ON CONFLICT ("playerId", "wordId") DO NOTHING;

-- AlterTable
ALTER TABLE "Card"
  DROP COLUMN "masteryProgress",
  DROP COLUMN "condition",
  DROP COLUMN "lastUsedAt";

-- AddForeignKey
ALTER TABLE "WordProgress"
  ADD CONSTRAINT "WordProgress_playerId_fkey"
  FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordProgress"
  ADD CONSTRAINT "WordProgress_wordId_fkey"
  FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
