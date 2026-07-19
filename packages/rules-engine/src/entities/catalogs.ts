import type { CharacterPreset } from "./character/character-preset.js";
import type { Equipment } from "./character/equipments/equipment.js";
import type { Skill } from "./character/skills/skill.js";
import type { Trait } from "./character/traits/trait.js";
import type { Modifier } from "./character/traits/modifiers/modifier.js";

/**
 * Unified source of character entities. The same Trait and Equipment types are
 * also stored directly in a character.
 */
export interface Catalogs {
  readonly defaultCharacterPresetId: string;
  readonly characterPresets: readonly CharacterPreset[];
  readonly traits: readonly Trait[];
  readonly skills: readonly Skill[];
  readonly modifiers: readonly Modifier[];
  readonly equipment: readonly Equipment[];
}
