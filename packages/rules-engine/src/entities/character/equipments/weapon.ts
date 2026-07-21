import type { Item } from "./item.js";
import type { Decimal } from "../../common.js";

export interface WeaponSkillModifier {
  readonly skillId: string;
  readonly modifier: number;
}

/** A weapon item with per-skill attack modifiers. */
export interface Weapon extends Item {
  readonly usage: "melee" | "ranged";
  readonly skills: readonly WeaponSkillModifier[];
  readonly damage: string;
  readonly damageType: string;
  readonly reach: string | null;
  readonly accuracy: Decimal | null;
  readonly range: string | null;
  readonly rateOfFire: string | null;
  readonly shots: string | null;
  readonly bulk: Decimal | null;
}
