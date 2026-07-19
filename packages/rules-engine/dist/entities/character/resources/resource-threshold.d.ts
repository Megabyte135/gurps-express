import type { Decimal, EntityId } from "../../common.js";
export interface ResourceThreshold {
    /** Compared with the resource maximum, e.g. "0.5" for half of maximum. */
    readonly multiplier: Decimal;
    readonly conditionIds: readonly EntityId[];
}
//# sourceMappingURL=resource-threshold.d.ts.map