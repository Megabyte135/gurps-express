import type { CatalogKey, Computable } from "../../common.js";
import type { Formula } from "../../formulas/formula.js";
import type { Effect } from "../effects/effect.js";
import type { ComputedValue } from "../../values/computed-value.js";
import type { Threshold } from "./threshold.js";

export interface Resource extends Computable {
  readonly catalogKey: CatalogKey;
  readonly type: "resource";
  readonly name: string;
  readonly description: string;
  readonly currentFormula: Formula;
  readonly minimumFormula: Formula;
  readonly maximumFormula: Formula;
  readonly maximumValue: ComputedValue;
  readonly thresholds: readonly Threshold[];
  readonly effects: readonly Effect[];
}
