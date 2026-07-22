import type { Item } from "./item.js";
import type { DamageResistance } from "../../rules/damage/damage-resistance.js";

/** A wearable armor item with damage resistance profile. */
export interface Armor extends Item {
  readonly damageResistance: DamageResistance;
}
