import type { Decimal, EntityId } from "../common.js";
import type { ValueChange, ValueChangeInput } from "./value-change.js";
export interface ChangeTrackedValueSnapshot {
    readonly baseValue: Decimal;
    readonly changesList: readonly ValueChange[];
}
/**
 * A parameter value with an append-only, reversible history. `value` cannot be
 * assigned directly: every mutation creates a ValueChange and is replayed from
 * baseValue when a change is removed.
 */
export declare class ChangeTrackedValue {
    #private;
    constructor(snapshot: ChangeTrackedValueSnapshot);
    get baseValue(): Decimal;
    get value(): Decimal;
    get changesList(): readonly ValueChange[];
    change(input: ValueChangeInput): ValueChange;
    revertChange(changeId: EntityId): boolean;
    /** Replaces a formula-derived baseline while preserving all explicit changes. */
    rebase(baseValue: Decimal): void;
    toSnapshot(): ChangeTrackedValueSnapshot;
}
//# sourceMappingURL=change-tracked-value.d.ts.map