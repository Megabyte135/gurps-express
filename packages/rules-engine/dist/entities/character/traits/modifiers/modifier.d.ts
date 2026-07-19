import type { CatalogKey, Decimal, EntityId, JsonSchema, JsonValue } from "../../../common.js";
import type { Prerequisite } from "../prerequisite.js";
export interface Modifier {
    readonly id: EntityId;
    readonly catalogKey: CatalogKey | null;
    readonly kind: "traitModifier";
    readonly name: string;
    readonly description: string;
    readonly tags: readonly string[];
    readonly appliesTo: readonly string[];
    readonly selectionsSchema: JsonSchema;
    readonly selections: Readonly<Record<string, JsonValue>>;
    readonly prerequisites: readonly Prerequisite[];
    readonly stacking: "unique" | "repeatable";
    readonly enabled: boolean;
    /** Percentage applied to the trait's absolute point cost before restoring its sign. */
    readonly costPercent: Decimal;
}
//# sourceMappingURL=modifier.d.ts.map