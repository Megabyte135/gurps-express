import type { EquipmentDefinition } from "./equipment/equipment-definition.js";
import type { CharacterRuleset } from "./character-ruleset.js";
import type { TraitDefinition } from "./traits/trait-definition.js";
import type { TraitModifierDefinition } from "./traits/modifiers/trait-modifier-definition.js";
/** The catalog is the only source of definitions used to create character instances. */
export interface CharacterCatalog {
    readonly defaultCharacterRulesetId: string;
    readonly characterRulesets: readonly CharacterRuleset[];
    readonly traits: readonly TraitDefinition[];
    readonly traitModifiers: readonly TraitModifierDefinition[];
    readonly equipment: readonly EquipmentDefinition[];
}
//# sourceMappingURL=character-catalog.d.ts.map