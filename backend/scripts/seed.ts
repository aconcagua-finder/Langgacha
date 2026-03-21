import { prisma } from "../src/db/prisma.js";
import { STARTING_DUST } from "../src/shared/constants.js";

import { WORDS } from "./seed-words.js";

const main = async (): Promise<void> => {
  const player =
    (await prisma.player.findFirst({ orderBy: { createdAt: "asc" } })) ??
    (await prisma.player.create({ data: { name: "Player", dust: STARTING_DUST } }));

  for (const w of WORDS) {
    await prisma.word.upsert({
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
      },
    });
  }

  // Migrate existing Spanish IDs to English (idempotent)
  await prisma.word.updateMany({ where: { type: "Persona" }, data: { type: "Person" } });
  await prisma.word.updateMany({ where: { type: "Lugar" }, data: { type: "Place" } });
  await prisma.word.updateMany({ where: { type: "Acción" }, data: { type: "Action" } });
  await prisma.word.updateMany({ where: { type: "Objeto" }, data: { type: "Object" } });
  await prisma.word.updateMany({ where: { type: "Emoción" }, data: { type: "Emotion" } });
  await prisma.word.updateMany({
    where: { type: "Expresión" },
    data: { type: "Expression" },
  });

  const total = await prisma.word.count();
  await prisma.card.updateMany({ where: { playerId: null }, data: { playerId: player.id } });
  // eslint-disable-next-line no-console
  console.log(`Seed complete. Words in pool: ${total}. Player: ${player.id}`);
};

try {
  await main();
} finally {
  await prisma.$disconnect();
}
