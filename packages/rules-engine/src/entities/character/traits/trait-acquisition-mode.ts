import type { Decimal } from "../../common.js";

export interface TraitAcquisitionMode {
  readonly minimum: Decimal;
  readonly maximum: Decimal | null;
  readonly increment: Decimal;
}
