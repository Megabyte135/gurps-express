import type { Attribute } from "../attributes/attribute.js";
import type { Formula } from "../../formulas/formula.js";

/** Configurable defaults for a character. Catalogs may expose any number of them. */
export interface CharacterPreset {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly primaryAttributes: readonly Attribute[];
  readonly secondaryAttributes: readonly Attribute[];
  readonly skillImprovementCostFormula: Formula;
}
