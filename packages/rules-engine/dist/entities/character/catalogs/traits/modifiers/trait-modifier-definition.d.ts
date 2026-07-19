import type { JsonSchema } from "../../../../common.js";
import type { CatalogDefinition } from "../../catalog-definition.js";
import type { CatalogCategory, Prerequisite } from "../trait-definition.js";
export interface TraitModifierDefinition extends CatalogDefinition {
    readonly kind: "traitModifier";
    readonly appliesTo: readonly CatalogCategory[];
    readonly selectionsSchema: JsonSchema;
    readonly prerequisites: readonly Prerequisite[];
    readonly stacking: "unique" | "repeatable";
}
//# sourceMappingURL=trait-modifier-definition.d.ts.map