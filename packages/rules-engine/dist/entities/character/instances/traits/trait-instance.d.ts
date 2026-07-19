import type { Decimal, EntityId, JsonValue } from "../../../common.js";
import type { CatalogDefinitionRef } from "../../catalogs/catalog-definition.js";
import type { AcquisitionMode, CatalogCategory } from "../../catalogs/traits/trait-definition.js";
export interface TraitModifierInstance {
    readonly id: EntityId;
    readonly definitionRef: CatalogDefinitionRef;
    readonly enabled: boolean;
    readonly selections: Readonly<Record<string, JsonValue>>;
}
export interface TraitInstance {
    readonly id: EntityId;
    readonly category: CatalogCategory;
    readonly definitionRef: CatalogDefinitionRef;
    readonly acquisition: {
        readonly mode: AcquisitionMode;
        readonly value: Decimal;
    };
    readonly selections: Readonly<Record<string, JsonValue>>;
    readonly modifiers: readonly TraitModifierInstance[];
    readonly notes: string;
}
//# sourceMappingURL=trait-instance.d.ts.map