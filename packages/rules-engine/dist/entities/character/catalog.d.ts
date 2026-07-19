import type { CharacterRuleset } from "./character-ruleset.js";
import type { Equipment } from "./equipment/equipment.js";
import type { Trait } from "./traits/trait.js";
import type { TraitModifier } from "./traits/modifiers/trait-modifier.js";
/**
 * A unified source of character entities. The same Trait and Equipment types
 * are also stored directly in a character.
 */
export interface CharacterCatalog {
    readonly defaultCharacterRulesetId: string;
    readonly characterRulesets: readonly CharacterRuleset[];
    readonly traits: readonly Trait[];
    readonly traitModifiers: readonly TraitModifier[];
    readonly equipment: readonly Equipment[];
}
//# sourceMappingURL=catalog.d.ts.map