import type { EntityId } from "../common.js";
import type { Formula } from "../formulas/formula.js";
import type { Anatomy } from "./anatomy/anatomy.js";
import type { CharacterAttributeCollection } from "./templates/attribute-collection.js";
import type { Condition } from "./conditions/condition.js";
import type { CharacterCustomField } from "./backgrounds/custom-field.js";
import type { Item } from "./equipments/item.js";
import type { CharacterIdentity } from "./backgrounds/identity.js";
import type { CharacterNotes } from "./backgrounds/notes.js";
import type { Resource } from "./resources/resource.js";
import type { Skill } from "./skills/skill.js";
import type { Trait } from "./traits/trait.js";
import type { Decimal } from "../common.js";

export interface Character {
  readonly id: EntityId;
  readonly identity: CharacterIdentity;
  readonly build: CharacterBuild;
  readonly skillImprovementCostFormula: Formula;
  readonly skillTrainingFormula: Formula;
  readonly attributes: readonly Attribute[];
  readonly traits: readonly Trait[];
  readonly skills: readonly Skill[];
  readonly anatomy: Anatomy;
  readonly conditions: readonly Condition[];
  readonly resources: readonly Resource[];
  readonly inventory: readonly Item[];
  readonly notes: CharacterNotes;
  readonly customFields: readonly CharacterCustomField[];
}

export interface CharacterBuild {
  readonly pointBudget: Decimal | null;
  readonly disadvantagePointLimit: Decimal | null;
  readonly disadvantageCountLimit: number | null;
  readonly techLevel: Decimal | null;
}
