import type { Decimal, EntityId } from "../common.js";
import type { CatalogDefinitionRef } from "./catalogs/catalog-definition.js";
import type { EquipmentInstance } from "./instances/equipment/equipment-instance.js";
import type { TraitInstance } from "./instances/traits/trait-instance.js";
export interface CharacterIdentity {
    readonly name: string;
    readonly aliases: readonly string[];
    readonly description: string;
    readonly appearance: string;
    readonly biography: string;
}
export interface CharacterBuild {
    readonly pointBudget: Decimal | null;
    readonly techLevel: Decimal | null;
}
/** Value configured for one primary or secondary catalog attribute. */
export interface CharacterAttributeInstance {
    readonly definitionRef: CatalogDefinitionRef;
    readonly value: Decimal;
}
export interface CharacterAttributes {
    readonly primary: readonly CharacterAttributeInstance[];
    readonly secondaryAdjustments: readonly CharacterAttributeInstance[];
}
export interface LoadoutInstance {
    readonly id: EntityId;
    readonly name: string;
    readonly itemIds: readonly EntityId[];
    readonly slots: readonly {
        readonly slot: string;
        readonly itemId: EntityId;
    }[];
}
/** Editable character instance. It references definitions exclusively through the catalog. */
export interface CharacterInstance {
    readonly id: EntityId;
    readonly characterRulesetRef: CatalogDefinitionRef;
    readonly identity: CharacterIdentity;
    readonly build: CharacterBuild;
    readonly attributes: CharacterAttributes;
    readonly traits: readonly TraitInstance[];
    readonly equipment: readonly EquipmentInstance[];
    readonly loadouts: readonly LoadoutInstance[];
    readonly notes: {
        readonly public: string;
        readonly private: string;
    };
}
//# sourceMappingURL=character-instance.d.ts.map