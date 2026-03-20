import { CONDITION_MODIFIERS, INSPIRATION_BONUS } from "../../shared/constants.js";
import type { BattleCard, CombatTick } from "./battle.types.js";

export const applyConditionModifier = (value: number, condition: string): number => {
  const m = CONDITION_MODIFIERS[condition] ?? 1;
  return Math.round(value * m);
};

export const computeHp = (effectiveDef: number): number => Math.round(effectiveDef * 1.5);

export const computeDamage = (attackerAtk: number, defenderDef: number): number => {
  const dmg = attackerAtk - defenderDef * 0.5;
  return Math.max(1, Math.round(dmg));
};

export const simulateCombat = (params: {
  player: Pick<BattleCard, "atk" | "def">;
  bot: Pick<BattleCard, "atk" | "def">;
  playerHp: number;
  botHp: number;
  inspirationApplied: boolean;
}): { log: CombatTick[]; winner: "player" | "bot"; survivorHpLeft: number } => {
  const log: CombatTick[] = [];

  let playerHp = params.playerHp;
  let botHp = params.botHp;

  const playerAtk = params.inspirationApplied
    ? Math.round(params.player.atk * (1 + INSPIRATION_BONUS))
    : params.player.atk;

  let attacker: "player" | "bot" = "player";
  while (playerHp > 0 && botHp > 0) {
    if (attacker === "player") {
      const damage = computeDamage(playerAtk, params.bot.def);
      botHp = Math.round(botHp - damage);
      log.push({ attacker: "player", damage, targetHpAfter: Math.max(0, botHp) });
      attacker = "bot";
    } else {
      const damage = computeDamage(params.bot.atk, params.player.def);
      playerHp = Math.round(playerHp - damage);
      log.push({ attacker: "bot", damage, targetHpAfter: Math.max(0, playerHp) });
      attacker = "player";
    }
  }

  const winner: "player" | "bot" = playerHp > 0 ? "player" : "bot";
  const survivorHpLeft = Math.max(0, winner === "player" ? playerHp : botHp);
  return { log, winner, survivorHpLeft };
};
