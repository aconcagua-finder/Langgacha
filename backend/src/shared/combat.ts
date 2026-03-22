import { CONDITION_MODIFIERS, DEF_SCALING_FACTOR } from "./constants.js";

const MIN_DAMAGE_SHARE = 0.08;

export const applyConditionModifier = (value: number, condition: string): number => {
  const m = CONDITION_MODIFIERS[condition] ?? 1;
  return Math.round(value * m);
};

export const computeHp = (effectiveDef: number): number => Math.round(effectiveDef * 1.5);

export const computeDamage = (
  attackerAtk: number,
  defenderDef: number,
  defenderMaxHp?: number,
): number => {
  const reduction = defenderDef / (defenderDef + DEF_SCALING_FACTOR);
  const baseDmg = attackerAtk * (1 - reduction);
  const minDmg = defenderMaxHp ? Math.max(1, Math.round(defenderMaxHp * MIN_DAMAGE_SHARE)) : 1;
  return Math.max(minDmg, Math.round(baseDmg));
};
