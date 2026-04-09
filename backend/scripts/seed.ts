import { prisma } from "../src/db/prisma.js";
import { STARTING_DUST } from "../src/shared/constants.js";

import { THEMES, THEME_KEYS } from "./seed-themes.js";
import { WORDS } from "./seed-words.js";
import { WORD_TAXONOMY } from "./seed-words-taxonomy.js";
import type { CefrLevel } from "./seed-words.types.js";

/**
 * Resolve taxonomy for a word: for new Core words it's inline,
 * for legacy words it's looked up in WORD_TAXONOMY by conceptKey.
 */
const resolveTaxonomy = (
  w: (typeof WORDS)[number],
): { cefrLevel: CefrLevel | null; isCore: boolean; themes: string[] } => {
  // Prefer inline fields if they exist (new files like seed-words-core.ts)
  if (w.cefrLevel !== undefined) {
    return {
      cefrLevel: w.cefrLevel,
      isCore: w.isCore ?? false,
      themes: w.themes ?? [],
    };
  }

  // Fall back to taxonomy map for legacy files (by conceptKey)
  if (!w.conceptKey) {
    console.warn(`[seed] Word "${w.word}" has no conceptKey and no inline taxonomy. Skipping theme assignment.`);
    return { cefrLevel: null, isCore: false, themes: [] };
  }

  const mapped = WORD_TAXONOMY[w.conceptKey];
  if (!mapped) {
    console.warn(
      `[seed] Word "${w.word}" (${w.conceptKey}) has no taxonomy mapping. ` +
        `Add it to seed-words-taxonomy.ts. Skipping theme assignment.`,
    );
    return { cefrLevel: null, isCore: false, themes: [] };
  }

  return {
    cefrLevel: mapped.cefrLevel,
    isCore: mapped.isCore ?? false,
    themes: mapped.themes,
  };
};

const main = async (): Promise<void> => {
  // 1. Seed themes (idempotent upsert)
  for (const t of THEMES) {
    await prisma.theme.upsert({
      where: { key: t.key },
      create: {
        key: t.key,
        nameRu: t.nameRu,
        nameEs: t.nameEs,
        domain: t.domain,
        cefrTier: t.cefrTier,
        orderIndex: t.orderIndex,
        emoji: t.emoji,
        description: t.description,
      },
      update: {
        nameRu: t.nameRu,
        nameEs: t.nameEs,
        domain: t.domain,
        cefrTier: t.cefrTier,
        orderIndex: t.orderIndex,
        emoji: t.emoji,
        description: t.description,
      },
    });
  }

  // 2. Seed/retain player
  const player =
    (await prisma.player.findFirst({ orderBy: { createdAt: "asc" } })) ??
    (await prisma.player.create({ data: { name: "Player", dust: STARTING_DUST } }));

  // 3. Upsert words + word-theme relations
  let unknownThemeKeys = 0;
  for (const w of WORDS) {
    const { cefrLevel, isCore, themes } = resolveTaxonomy(w);

    // Validate themes exist in THEME_KEYS (fail loud rather than silently create bad refs)
    const validThemes = themes.filter((k) => {
      if (!THEME_KEYS.has(k)) {
        unknownThemeKeys += 1;
        console.warn(`[seed] Word "${w.word}" references unknown theme "${k}". Skipping that theme.`);
        return false;
      }
      return true;
    });

    const created = await prisma.word.upsert({
      where: { language_word: { language: w.language, word: w.word } },
      create: {
        language: w.language,
        conceptKey: w.conceptKey,
        word: w.word,
        translationRu: w.translationRu,
        type: w.type,
        rarity: w.rarity,
        baseAtk: w.baseAtk,
        baseDef: w.baseDef,
        colorido: w.colorido,
        flavorText: w.flavorText,
        hint: w.hint,
        tags: w.tags,
        canEvolve: w.canEvolve ?? false,
        imagePrompt: w.imagePrompt ?? null,
        quizCorrect: w.quizCorrect,
        quizOptions: w.quizOptions,
        evolutionData: w.evolutionData ?? undefined,
        cefrLevel: cefrLevel,
        isCore: isCore,
        dialect: w.dialect ?? "rioplatense",
      },
      update: {
        conceptKey: w.conceptKey,
        translationRu: w.translationRu,
        type: w.type,
        rarity: w.rarity,
        baseAtk: w.baseAtk,
        baseDef: w.baseDef,
        colorido: w.colorido,
        flavorText: w.flavorText,
        hint: w.hint,
        tags: w.tags,
        canEvolve: w.canEvolve ?? false,
        imagePrompt: w.imagePrompt ?? null,
        quizCorrect: w.quizCorrect,
        quizOptions: w.quizOptions,
        evolutionData: w.evolutionData ?? undefined,
        cefrLevel: cefrLevel,
        isCore: isCore,
        dialect: w.dialect ?? "rioplatense",
      },
    });

    // Rebuild WordTheme links for this word (idempotent)
    await prisma.wordTheme.deleteMany({ where: { wordId: created.id } });
    for (let i = 0; i < validThemes.length; i += 1) {
      await prisma.wordTheme.create({
        data: {
          wordId: created.id,
          themeKey: validThemes[i]!,
          isPrimary: i === 0,
        },
      });
    }
  }

  // 4. Legacy type migration (Spanish → English, kept for safety on old DBs)
  await prisma.word.updateMany({ where: { type: "Persona" }, data: { type: "Person" } });
  await prisma.word.updateMany({ where: { type: "Lugar" }, data: { type: "Place" } });
  await prisma.word.updateMany({ where: { type: "Acción" }, data: { type: "Action" } });
  await prisma.word.updateMany({ where: { type: "Objeto" }, data: { type: "Object" } });
  await prisma.word.updateMany({ where: { type: "Emoción" }, data: { type: "Emotion" } });
  await prisma.word.updateMany({
    where: { type: "Expresión" },
    data: { type: "Expression" },
  });

  // 5. Ensure ownerless cards belong to the main player
  await prisma.card.updateMany({ where: { playerId: null }, data: { playerId: player.id } });

  // 6. Final stats
  const totalWords = await prisma.word.count();
  const totalThemes = await prisma.theme.count();
  const coreWords = await prisma.word.count({ where: { isCore: true } });
  const wordThemeLinks = await prisma.wordTheme.count();

  // eslint-disable-next-line no-console
  console.log(
    `Seed complete. Words: ${totalWords} (${coreWords} core). Themes: ${totalThemes}. WordTheme links: ${wordThemeLinks}. Player: ${player.id}.` +
      (unknownThemeKeys > 0 ? ` ⚠ ${unknownThemeKeys} unknown theme refs skipped.` : ""),
  );
};

try {
  await main();
} finally {
  await prisma.$disconnect();
}
