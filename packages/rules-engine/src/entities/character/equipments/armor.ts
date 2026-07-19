import type { Decimal } from "../../common.js";

export interface Armor {
  readonly damageResistance: Decimal;
  readonly hitLocationIds: readonly string[];
}
