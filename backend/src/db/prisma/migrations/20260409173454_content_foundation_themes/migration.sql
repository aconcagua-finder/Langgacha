-- Content Foundation (Phase 2.18): Theme taxonomy, CEFR, Core flag, dialect
-- See docs/content-plan.md and docs/taxonomy.md

-- 1. Extend Word with taxonomy fields
ALTER TABLE "Word"
  ADD COLUMN "cefrLevel" TEXT,
  ADD COLUMN "isCore" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "dialect" TEXT NOT NULL DEFAULT 'rioplatense';

CREATE INDEX "Word_cefrLevel_idx" ON "Word"("cefrLevel");
CREATE INDEX "Word_isCore_idx" ON "Word"("isCore");

-- 2. Theme table — 32 themes will be populated by seed-themes.ts
CREATE TABLE "Theme" (
  "key"         TEXT PRIMARY KEY,
  "nameRu"      TEXT NOT NULL,
  "nameEs"      TEXT NOT NULL,
  "domain"      TEXT NOT NULL,
  "cefrTier"    TEXT NOT NULL,
  "orderIndex"  INTEGER NOT NULL DEFAULT 0,
  "emoji"       TEXT,
  "description" TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Theme_domain_idx" ON "Theme"("domain");
CREATE INDEX "Theme_cefrTier_idx" ON "Theme"("cefrTier");

-- 3. WordTheme — many-to-many with isPrimary marker
CREATE TABLE "WordTheme" (
  "wordId"    TEXT NOT NULL,
  "themeKey"  TEXT NOT NULL,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,

  CONSTRAINT "WordTheme_pkey" PRIMARY KEY ("wordId", "themeKey"),
  CONSTRAINT "WordTheme_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "WordTheme_themeKey_fkey" FOREIGN KEY ("themeKey") REFERENCES "Theme"("key") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "WordTheme_themeKey_idx" ON "WordTheme"("themeKey");
CREATE INDEX "WordTheme_wordId_idx" ON "WordTheme"("wordId");
