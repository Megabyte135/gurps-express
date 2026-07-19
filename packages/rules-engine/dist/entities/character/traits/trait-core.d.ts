import type { Decimal, EntityId, JsonSchema, JsonValue, CatalogKey } from "../../common.js";
import type { Effect } from "../effects/effect.js";
import type { TraitModifier } from "./modifiers/trait-modifier.js";
import type { AcquisitionMode, AcquisitionRule } from "./acquisition-rule.js";
import type { Prerequisite } from "./prerequisite.js";
export interface TraitCore {
    readonly id: EntityId;
    readonly catalogKey: CatalogKey;
    readonly name: string;
    readonly description: string;
    readonly tags: readonly string[];
    readonly acquisitionRules: readonly AcquisitionRule[];
    readonly acquisition: {
        readonly mode: AcquisitionMode;
        readonly value: Decimal;
    } | null;
    readonly selectionsSchema: JsonSchema;
    readonly selections: Readonly<Record<string, JsonValue>>;
    readonly prerequisites: readonly Prerequisite[];
    readonly modifierIds: readonly string[];
    readonly modifiers: readonly TraitModifier[];
    readonly effects: readonly Effect[];
    readonly notes: string;
}
//# sourceMappingURL=trait-core.d.ts.map