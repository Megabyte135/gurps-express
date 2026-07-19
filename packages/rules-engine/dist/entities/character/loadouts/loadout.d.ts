import type { EntityId } from "../../common.js";
import type { LoadoutSlot } from "./loadout-slot.js";
export interface Loadout {
    readonly id: EntityId;
    readonly name: string;
    readonly itemIds: readonly EntityId[];
    readonly slots: readonly LoadoutSlot[];
}
//# sourceMappingURL=loadout.d.ts.map