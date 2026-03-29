ALTER TABLE "WordProgress"
  ADD COLUMN "xp" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "level" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "lastDecayAt" TIMESTAMP(3);

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
  END;

ALTER TABLE "WordProgress"
  ALTER COLUMN "lastReviewedAt" DROP NOT NULL,
  ALTER COLUMN "lastReviewedAt" DROP DEFAULT,
  DROP COLUMN "masteryProgress";
