import type { Decimal, EntityId } from "../../common.js";
export interface Threshold {
    /** Compared with the resource maximum, e.g. "0.5" for half of maximum. */
    readonly multiplier: Decimal;
    readonly conditionIds: readonly EntityId[];
}
//# sourceMappingURL=threshold.d.ts.map