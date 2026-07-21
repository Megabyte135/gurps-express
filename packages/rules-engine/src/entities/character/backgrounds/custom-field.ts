import type { EntityId } from "../../common.js";

export interface CharacterCustomField {
  readonly id: EntityId;
  readonly name: string;
  readonly value: string;
}
