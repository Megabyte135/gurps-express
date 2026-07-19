import type { Decimal } from "../../common.js";
import type { Formula } from "../../formulas/formula.js";

export interface AttributeImprovementRule {
  readonly maximumLevel: Decimal;
  readonly costFormula: Formula;
}
