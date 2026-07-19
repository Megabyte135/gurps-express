import type { EntityId } from "../common.js";
import type { Formula } from "../formulas/formula.js";
import type { Anatomy } from "./anatomy/anatomy.js";
import type { CharacterAttributeCollection } from "./attribute-collection.js";
import type { CharacterBuild } from "./build.js";
import type { Condition } from "./conditions/condition.js";
import type { CharacterCustomField } from "./fields/custom-field.js";
import type { Equipment } from "./equipments/equipment.js";
import type { CharacterIdentity } from "./fields/identity.js";
import type { CharacterNotes } from "./fields/notes.js";
import type { Loadout } from "./loadouts/loadout.js";
import type { Resource } from "./resources/resource.js";
import type { Skill } from "./skills/skill.js";
import type { Trait } from "./traits/trait.js";
export interface Character {
    readonly id: EntityId;
    readonly identity: CharacterIdentity;
    readonly build: CharacterBuild;
    readonly skillImprovementCostFormula: Formula;
    readonly attributes: CharacterAttributeCollection;
    readonly traits: readonly Trait[];
    readonly skills: readonly Skill[];
    readonly anatomy: Anatomy;
    readonly conditions: readonly Condition[];
    readonly resources: readonly Resource[];
    readonly equipment: readonly Equipment[];
    readonly loadouts: readonly Loadout[];
    readonly notes: CharacterNotes;
    readonly customFields: readonly CharacterCustomField[];
}
//# sourceMappingURL=character.d.ts.map