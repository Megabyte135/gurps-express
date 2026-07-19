import type { CatalogKey, Decimal, EntityId, JsonSchema, JsonValue } from "../../common.js";
import type { Formula } from "../../formulas/formula.js";
import type { Effect } from "../effects/effect.js";
import type { AcquisitionMode, AcquisitionRule } from "../traits/acquisition-rule.js";
import type { Modifier } from "../traits/modifiers/modifier.js";
import type { Prerequisite } from "../traits/prerequisite.js";
import type { ChangeTrackedValue } from "../../values/change-tracked-value.js";
import type { SkillBase } from "./skill-base.js";

export interface Skill {
  readonly id: EntityId;
  readonly catalogKey: CatalogKey;
  readonly kind: "skill";
  readonly category: "skill";
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
  readonly base: SkillBase;
  readonly difficulty: Decimal;
  /** Used when no experience is invested; it may reference attributes or skills. */
  readonly defaultFormulas: readonly Formula[];
  /** The points invested by the player. */
  readonly experience: Decimal;
  readonly value: ChangeTrackedValue;
}
