import type { Decimal, EntityId } from "../common.js";
import type { ChangeSource } from "./change-source.js";
export type ChangeOperand = "add" | "multiply" | "divide";
/** One reversible operation that changed a parameter's effective value. */
export interface ValueChange {
    readonly id: EntityId;
    readonly sequence: number;
    readonly reason: string;
    readonly source: ChangeSource;
    readonly operand: ChangeOperand;
    readonly magnitude: Decimal;
}
export interface ValueChangeInput {
    readonly id: EntityId;
    readonly reason: string;
    readonly source: ChangeSource;
    readonly operand: ChangeOperand;
    readonly magnitude: Decimal;
}
//# sourceMappingURL=value-change.d.ts.map