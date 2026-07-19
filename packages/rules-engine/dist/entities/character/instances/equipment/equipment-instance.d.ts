import type { Decimal, EntityId, JsonValue } from "../../../common.js";
import type { CatalogDefinitionRef } from "../../catalogs/catalog-definition.js";
/**
 * A character-owned item. Catalog-derived and user-authored items share this
 * shape; `definitionRef` is null only when no catalog definition was used.
 */
export interface EquipmentInstance {
    readonly id: EntityId;
    readonly definitionRef: CatalogDefinitionRef | null;
    readonly name: string;
    readonly weight: Decimal;
    readonly price: Decimal;
    readonly description: string;
    readonly quantity: number;
    readonly containerItemId: EntityId | null;
    readonly configuration: Readonly<Record<string, JsonValue>>;
    readonly notes: string;
}
//# sourceMappingURL=equipment-instance.d.ts.map