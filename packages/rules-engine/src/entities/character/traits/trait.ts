import type { CatalogKey, Decimal, Entity } from "../../common.js";
import type { Effect } from "../effects/effect.js";
import type { TraitAcquisitionMode } from "./trait-acquisition-mode.js";
import type { Modifier } from "./modifiers/modifier.js";
import type { Prerequisite } from "./prerequisite.js";

/** A copied advantage, disadvantage, perk, quirk, template, or similar trait. */
export interface Trait extends Entity {
  readonly catalogKey: CatalogKey;
  readonly type: "trait";
  readonly category: string;
  readonly name: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly acquisitionRules: readonly TraitAcquisitionMode[];
  readonly acquisition: { readonly value: Decimal } | null;
  readonly prerequisites: readonly Prerequisite[];
  readonly modifierIds: readonly string[];
  readonly modifiers: readonly Modifier[];
  readonly effects: readonly Effect[];
  readonly notes: string;
  /** Positive is an advantage; negative is a disadvantage. */
  readonly pointCost: Decimal;
}
