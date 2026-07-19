import type { EntityId } from "../../common.js";

export interface LoadoutSlot {
  readonly slot: string;
  readonly itemId: EntityId;
}
