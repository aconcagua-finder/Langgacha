import { CONDITION_MODIFIERS, DEF_SCALING_FACTOR } from "./constants.js";

export const applyConditionModifier = (value: number, condition: string): number => {
  const m = CONDITION_MODIFIERS[condition] ?? 1;
  return Math.round(value * m);
};

export const computeHp = (effectiveDef: number): number => Math.round(effectiveDef * 1.5);

export const computeDamage = (attackerAtk: number, defenderDef: number): number => {
  const reduction = defenderDef / (defenderDef + DEF_SCALING_FACTOR);
  const dmg = attackerAtk * (1 - reduction);
  return Math.max(1, Math.round(dmg));
};
