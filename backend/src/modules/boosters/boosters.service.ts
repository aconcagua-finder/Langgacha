import { prisma } from "../../db/prisma.js";
import { rollRarity, type Rarity } from "../../shared/constants.js";
import { generateCardFromPool } from "../cards/cards.generator.js";
import type { OpenBoosterResponse } from "./boosters.types.js";

const UC_PLUS: Rarity[] = ["UC", "R", "SR", "SSR"];

const getAvailableRarities = async (): Promise<Rarity[]> => {
  const grouped = await prisma.word.groupBy({
    by: ["rarity"],
    _count: { _all: true },
  });
  const set = new Set<Rarity>();
  for (const g of grouped) {
    if (g._count._all > 0) set.add(g.rarity as Rarity);
  }
  // Preserve a stable order for rollRarity
  const order: Rarity[] = ["C", "UC", "R", "SR", "SSR"];
  return order.filter((r) => set.has(r));
};

export const openBooster = async (): Promise<OpenBoosterResponse> => {
  const available = await getAvailableRarities();
  if (available.length === 0) throw new Error("Word pool is empty. Run seed first.");

  const rolledRarities: Rarity[] = Array.from({ length: 5 }, () =>
    rollRarity(available),
  );

  const hasUcPlus = rolledRarities.some((r) => r !== "C");
  if (!hasUcPlus) {
    const allowedUcPlus = UC_PLUS.filter((r) => available.includes(r));
    rolledRarities[4] = rollRarity(allowedUcPlus.length ? allowedUcPlus : available);
    if (rolledRarities[4] === "C" && allowedUcPlus.length) rolledRarities[4] = allowedUcPlus[0];
  }

  const cards = await Promise.all(
    rolledRarities.map((rarity) => generateCardFromPool({ rarity })),
  );

  // Safety: if due to missing rarities we still got all C, force-replace last card from UC+
  if (cards.every((c) => c.rarity === "C")) {
    const allowedUcPlus = UC_PLUS.filter((r) => available.includes(r));
    if (allowedUcPlus.length) {
      cards[4] = await generateCardFromPool({ rarity: rollRarity(allowedUcPlus) });
    }
  }

  return cards;
};

