import type { Word } from "@prisma/client";

import { prisma } from "../../db/prisma.js";
import {
  RAID_BOSS_ATK_SCALE,
  RAID_BOSS_DEF_SCALE,
  RAID_BOSS_DIFFICULTY_MAX,
  RAID_BOSS_DIFFICULTY_MIN,
  RAID_BOSS_HP_MULTIPLIER,
  RAID_BOSS_TOP_CARD_COUNT,
  randomBetween,
} from "../../shared/constants.js";

const pickRandomWord = async (where?: { rarity?: { in: string[] } }): Promise<Word> => {
  const count = await prisma.word.count({ where });
  if (count === 0) throw new Error("Word pool is empty. Run seed first.");
  const skip = Math.floor(Math.random() * count);
  const word = await prisma.word.findFirst({ where, skip, orderBy: { id: "asc" } });
  if (!word) throw new Error("Failed to pick a random word.");
  return word;
};

const getPlayerBaseline = async (
  playerId?: string,
): Promise<{ avgPlayerAtk: number; avgPlayerDef: number }> => {
  let avgPlayerAtk = 300;
  let avgPlayerDef = 300;

  if (!playerId) {
    return { avgPlayerAtk, avgPlayerDef };
  }

  const playerCards = await prisma.card.findMany({
    where: { playerId },
    select: { atk: true, def: true },
    orderBy: [{ atk: "desc" }, { def: "desc" }],
    take: RAID_BOSS_TOP_CARD_COUNT,
  });

  if (playerCards.length > 0) {
    avgPlayerAtk = Math.round(
      playerCards.reduce((sum, card) => sum + card.atk, 0) / playerCards.length,
    );
    avgPlayerDef = Math.round(
      playerCards.reduce((sum, card) => sum + card.def, 0) / playerCards.length,
    );
  }

  return { avgPlayerAtk, avgPlayerDef };
};

export const generateRaidBoss = async (date: string, playerId?: string) => {
  const preferred = ["R", "SR", "SSR"];
  const preferredCount = await prisma.word.count({ where: { rarity: { in: preferred } } });
  const word =
    preferredCount > 0
      ? await pickRandomWord({ rarity: { in: preferred } })
      : await pickRandomWord();

  const { avgPlayerAtk, avgPlayerDef } = await getPlayerBaseline(playerId);
  const difficultyMultiplier = randomBetween(
    RAID_BOSS_DIFFICULTY_MIN,
    RAID_BOSS_DIFFICULTY_MAX,
  );

  const bossDef = Math.round(avgPlayerAtk * difficultyMultiplier * RAID_BOSS_DEF_SCALE);
  const bossAtk = Math.round(avgPlayerDef * difficultyMultiplier * RAID_BOSS_ATK_SCALE);
  const bossHp = Math.round(avgPlayerAtk * difficultyMultiplier * RAID_BOSS_HP_MULTIPLIER);

  return prisma.raidDay.create({
    data: {
      date,
      bossWord: word.word,
      bossHp,
      currentHp: bossHp,
      bossAtk,
      bossDef,
      bossRarity: word.rarity,
      bossType: word.type,
      bossFlavorText: word.flavorText ?? "",
    },
  });
};
