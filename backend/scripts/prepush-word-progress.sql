CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'Player'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'Word'
  ) THEN
    EXECUTE '
      CREATE TABLE IF NOT EXISTS "WordProgress" (
        "id" TEXT NOT NULL,
        "playerId" TEXT NOT NULL,
        "wordId" TEXT NOT NULL,
        "masteryProgress" INTEGER NOT NULL DEFAULT 0,
        "lastReviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "WordProgress_pkey" PRIMARY KEY ("id")
      )';

    EXECUTE '
      CREATE UNIQUE INDEX IF NOT EXISTS "WordProgress_playerId_wordId_key"
      ON "WordProgress"("playerId", "wordId")';

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'Card'
        AND column_name = 'masteryProgress'
    ) AND EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'Card'
        AND column_name = 'lastUsedAt'
    ) THEN
      INSERT INTO "WordProgress" ("id", "playerId", "wordId", "masteryProgress", "lastReviewedAt")
      SELECT
        gen_random_uuid()::text,
        c."playerId",
        c."wordId",
        MAX(c."masteryProgress"),
        COALESCE(MAX(c."lastUsedAt"), CURRENT_TIMESTAMP)
      FROM "Card" c
      WHERE c."playerId" IS NOT NULL
      GROUP BY c."playerId", c."wordId"
      ON CONFLICT ("playerId", "wordId") DO UPDATE SET
        "masteryProgress" = GREATEST("WordProgress"."masteryProgress", EXCLUDED."masteryProgress"),
        "lastReviewedAt" = GREATEST("WordProgress"."lastReviewedAt", EXCLUDED."lastReviewedAt");
    END IF;
  END IF;
END $$;
