import type { Decimal, JsonSchema } from "../../../common.js";
import type { CatalogDefinition } from "../catalog-definition.js";
import type { ArmorDefinition } from "./armor-definition.js";
import type { WeaponModeDefinition } from "./weapon-mode-definition.js";
export interface EquipmentDefinition extends CatalogDefinition {
    readonly kind: "equipment";
    readonly weight: Decimal;
    readonly price: Decimal;
    readonly configurationSchema: JsonSchema;
    readonly isContainer: boolean;
    readonly capacity: Decimal | null;
    readonly isUnique: boolean;
    readonly weaponModes: readonly WeaponModeDefinition[];
    readonly armor: ArmorDefinition | null;
}
//# sourceMappingURL=equipment-definition.d.ts.map