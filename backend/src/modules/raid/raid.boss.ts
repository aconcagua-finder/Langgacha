import type { Word } from "@prisma/client";

import { prisma } from "../../db/prisma.js";
import {
  RAID_BOSS_ATK_SCALE,
  RAID_BOSS_HP_MULTIPLIER,
  rollStat,
  type Rarity,
} from "../../shared/constants.js";

const pickRandomWord = async (where?: { rarity?: { in: string[] } }): Promise<Word> => {
  const count = await prisma.word.count({ where });
  if (count === 0) throw new Error("Word pool is empty. Run seed first.");
  const skip = Math.floor(Math.random() * count);
  const word = await prisma.word.findFirst({ where, skip, orderBy: { id: "asc" } });
  if (!word) throw new Error("Failed to pick a random word.");
  return word;
};

export const generateRaidBoss = async (date: string) => {
  const preferred = ["R", "SR", "SSR"];
  const preferredCount = await prisma.word.count({ where: { rarity: { in: preferred } } });
  const word = preferredCount > 0 ? await pickRandomWord({ rarity: { in: preferred } }) : await pickRandomWord();

  const rarity = word.rarity as Rarity;
  const bossHp = rollStat(rarity, 80) * RAID_BOSS_HP_MULTIPLIER;
  const bossAtk = Math.round(rollStat(rarity, 50) * RAID_BOSS_ATK_SCALE);
  const bossDef = rollStat(rarity, 60);

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

