import { CONDITION_MODIFIERS } from "./constants.js";

export const applyConditionModifier = (value: number, condition: string): number => {
  const m = CONDITION_MODIFIERS[condition] ?? 1;
  return Math.round(value * m);
};

export const computeHp = (effectiveDef: number): number => Math.round(effectiveDef * 1.5);

export const computeDamage = (attackerAtk: number, defenderDef: number): number => {
  const dmg = attackerAtk - defenderDef * 0.5;
  return Math.max(1, Math.round(dmg));
};

