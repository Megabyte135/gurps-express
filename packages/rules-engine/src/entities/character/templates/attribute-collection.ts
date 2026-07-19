import type { CharacterAttribute } from "../attributes/attribute.js";

export interface CharacterAttributeCollection {
  readonly primary: readonly CharacterAttribute[];
  readonly secondaryAdjustments: readonly CharacterAttribute[];
}
