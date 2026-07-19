import type { Decimal, EntityId, JsonSchema, JsonValue } from "../../common.js";
import type { CatalogRef } from "../catalog-ref.js";
import type { Armor } from "./armor.js";
import type { Weapon } from "./weapon.js";
/** An equipment entity has the same shape in a catalog and on a character. */
export interface Equipment {
    readonly id: EntityId;
    readonly catalogRef: CatalogRef | null;
    readonly kind: "equipment";
    readonly name: string;
    readonly description: string;
    readonly tags: readonly string[];
    readonly weight: Decimal;
    readonly price: Decimal;
    readonly configurationSchema: JsonSchema;
    readonly configuration: Readonly<Record<string, JsonValue>>;
    readonly isContainer: boolean;
    readonly capacity: Decimal | null;
    readonly isUnique: boolean;
    readonly weaponModes: readonly Weapon[];
    readonly armor: Armor | null;
    readonly quantity: number;
    readonly containerItemId: EntityId | null;
    readonly notes: string;
}
//# sourceMappingURL=equipment.d.ts.map