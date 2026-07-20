import type { Attribute } from "../attributes/attribute.js";

export interface CharacterAttributeCollection {
  readonly primary: readonly Attribute[];
  readonly secondaryAdjustments: readonly Attribute[];
}
