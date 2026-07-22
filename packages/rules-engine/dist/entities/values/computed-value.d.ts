import type { Decimal, EntityId } from "../common.js";
import type { Formula, FormulaContext } from "../formulas/formula.js";
import type { ComputedValueMutation, ComputedValueMutationInput } from "./value-mutation.js";
export interface ComputedValueSnapshot {
    readonly baseValue: Formula;
    readonly changesList: readonly ComputedValueMutation[];
    readonly context?: FormulaContext;
}
/** Evaluates a formula in the aggregate that owns this value. */
export interface FormulaResolver {
    resolve(formula: Formula, context?: FormulaContext): Decimal;
}
/**
 * A value that can be changed over time by reversible mutations.
 * Mutations are stored in an append-only history; computed value is always
 * replayed from baseValue so removal is safe and deterministic.
 */
export declare class ComputedValue {
    #private;
    constructor(snapshot: ComputedValueSnapshot, formulaResolver: FormulaResolver);
    get baseValue(): Formula;
    get value(): Decimal;
    get changesList(): readonly ComputedValueMutation[];
    get context(): FormulaContext;
    applyMutation(input: ComputedValueMutationInput): ComputedValueMutation;
    removeMutation(changeId: EntityId): boolean;
    /** Replaces the baseline formula while preserving all explicit changes. */
    rebase(baseValue: Formula): void;
    setContext(context: FormulaContext): void;
    toSnapshot(): ComputedValueSnapshot;
}
//# sourceMappingURL=computed-value.d.ts.map