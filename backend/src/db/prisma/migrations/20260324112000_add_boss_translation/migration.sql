ALTER TABLE "RaidDay"
ADD COLUMN "bossTranslationRu" TEXT NOT NULL DEFAULT '';

UPDATE "RaidDay" AS raid
SET "bossTranslationRu" = word."translationRu"
FROM "Word" AS word
WHERE raid."bossTranslationRu" = ''
  AND word."word" = raid."bossWord";
