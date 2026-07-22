import type { CatalogKey, Decimal, Entity, EntityId, JsonSchema, JsonValue } from "../../common.js";
/** A generic item entity has the same shape in a catalog and on a character. */
export interface Item extends Entity {
    readonly catalogKey: CatalogKey;
    readonly name: string;
    readonly description: string;
    readonly tags: readonly string[];
    readonly weight: Decimal;
    readonly price: Decimal;
    readonly imageUrl: string | null;
    readonly configurationSchema: JsonSchema;
    readonly configuration: Readonly<Record<string, JsonValue>>;
    readonly isContainer: boolean;
    readonly capacity: Decimal | null;
    readonly isUnique: boolean;
    readonly quantity: Decimal;
    readonly wearState: "worn" | "removed" | "stored";
    readonly containerItemId: EntityId | null;
    readonly notes: string;
}
//# sourceMappingURL=item.d.ts.map