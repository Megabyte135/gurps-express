import type { CharacterPreset } from "./character/templates/character-preset.js";
import type { Item } from "./character/equipments/item.js";
import type { Skill } from "./character/skills/skill.js";
import type { Trait } from "./character/traits/trait.js";
import type { Modifier } from "./character/traits/modifiers/modifier.js";

/**
 * Unified source of character entities.
 */
export interface Catalogs {
  readonly defaultCharacterPresetId: string;
  readonly characterPresets: readonly CharacterPreset[];
  readonly traits: readonly Trait[];
  readonly skills: readonly Skill[];
  readonly modifiers: readonly Modifier[];
  readonly equipment: readonly Item[];
}
