import type { CatalogKey, Decimal, EntityId, JsonSchema, JsonValue } from "../../common.js";
import type { Effect } from "../effects/effect.js";
import type { AcquisitionMode, AcquisitionRule } from "./acquisition-rule.js";
import type { Modifier } from "./modifiers/modifier.js";
import type { Prerequisite } from "./prerequisite.js";

/** A copied advantage, disadvantage, perk, quirk, template, or similar trait. */
export interface Trait {
  readonly id: EntityId;
  readonly catalogKey: CatalogKey;
  readonly kind: "trait";
  readonly category: string;
  readonly name: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly acquisitionRules: readonly AcquisitionRule[];
  readonly acquisition: { readonly mode: AcquisitionMode; readonly value: Decimal } | null;
  readonly selectionsSchema: JsonSchema;
  readonly selections: Readonly<Record<string, JsonValue>>;
  readonly prerequisites: readonly Prerequisite[];
  readonly modifierIds: readonly string[];
  readonly modifiers: readonly Modifier[];
  readonly effects: readonly Effect[];
  readonly notes: string;
  /** Positive is an advantage; negative is a disadvantage. */
  readonly pointCost: Decimal;
}
