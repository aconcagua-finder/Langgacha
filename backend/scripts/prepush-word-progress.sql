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
        "xp" INTEGER NOT NULL DEFAULT 0,
        "level" INTEGER NOT NULL DEFAULT 0,
        "lastReviewedAt" TIMESTAMP(3),
        "lastDecayAt" TIMESTAMP(3),
        CONSTRAINT "WordProgress_pkey" PRIMARY KEY ("id")
      )';

    EXECUTE 'ALTER TABLE "WordProgress" ADD COLUMN IF NOT EXISTS "xp" INTEGER NOT NULL DEFAULT 0';
    EXECUTE 'ALTER TABLE "WordProgress" ADD COLUMN IF NOT EXISTS "level" INTEGER NOT NULL DEFAULT 0';
    EXECUTE 'ALTER TABLE "WordProgress" ADD COLUMN IF NOT EXISTS "lastDecayAt" TIMESTAMP(3)';
    EXECUTE 'ALTER TABLE "WordProgress" ALTER COLUMN "lastReviewedAt" DROP NOT NULL';
    EXECUTE 'ALTER TABLE "WordProgress" ALTER COLUMN "lastReviewedAt" DROP DEFAULT';

    EXECUTE '
      CREATE UNIQUE INDEX IF NOT EXISTS "WordProgress_playerId_wordId_key"
      ON "WordProgress"("playerId", "wordId")';

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'WordProgress'
        AND column_name = 'masteryProgress'
    ) THEN
      EXECUTE '
        UPDATE "WordProgress"
        SET
          "xp" = CASE "masteryProgress"
            WHEN 0 THEN 0
            WHEN 1 THEN 25
            WHEN 2 THEN 75
            WHEN 3 THEN 175
            WHEN 4 THEN 375
            WHEN 5 THEN 625
            ELSE 0
          END,
          "level" = CASE "masteryProgress"
            WHEN 0 THEN 0
            WHEN 1 THEN 1
            WHEN 2 THEN 3
            WHEN 3 THEN 5
            WHEN 4 THEN 8
            WHEN 5 THEN 11
            ELSE 0
          END';
    END IF;

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
      INSERT INTO "WordProgress" ("id", "playerId", "wordId", "xp", "level", "lastReviewedAt", "lastDecayAt")
      SELECT
        gen_random_uuid()::text,
        c."playerId",
        c."wordId",
        CASE MAX(c."masteryProgress")
          WHEN 0 THEN 0
          WHEN 1 THEN 25
          WHEN 2 THEN 75
          WHEN 3 THEN 175
          WHEN 4 THEN 375
          WHEN 5 THEN 625
          ELSE 0
        END,
        CASE MAX(c."masteryProgress")
          WHEN 0 THEN 0
          WHEN 1 THEN 1
          WHEN 2 THEN 3
          WHEN 3 THEN 5
          WHEN 4 THEN 8
          WHEN 5 THEN 11
          ELSE 0
        END,
        COALESCE(MAX(c."lastUsedAt"), CURRENT_TIMESTAMP),
        NULL
      FROM "Card" c
      WHERE c."playerId" IS NOT NULL
      GROUP BY c."playerId", c."wordId"
      ON CONFLICT ("playerId", "wordId") DO UPDATE SET
        "xp" = GREATEST("WordProgress"."xp", EXCLUDED."xp"),
        "level" = GREATEST("WordProgress"."level", EXCLUDED."level"),
        "lastReviewedAt" = CASE
          WHEN "WordProgress"."lastReviewedAt" IS NULL THEN EXCLUDED."lastReviewedAt"
          WHEN EXCLUDED."lastReviewedAt" IS NULL THEN "WordProgress"."lastReviewedAt"
          ELSE GREATEST("WordProgress"."lastReviewedAt", EXCLUDED."lastReviewedAt")
        END;
    END IF;
  END IF;
END $$;
