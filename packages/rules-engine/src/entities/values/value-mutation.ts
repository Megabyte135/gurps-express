import type { Decimal, EntityId } from "../common.js";

export type ComputedValueMutationOperand = "add" | "multiply" | "divide";

export type ComputedValueMutationOriginKind = string;

export interface ComputedValueMutationOrigin {
  readonly kind: ComputedValueMutationOriginKind;
  readonly id: EntityId | null;
  readonly description: string;
}

/** One reversible operation that changed a computed numeric value. */
export interface ComputedValueMutation {
  readonly id: EntityId;
  readonly sequence: number;
  readonly reason: string;
  readonly source: ComputedValueMutationOrigin;
  readonly operand: ComputedValueMutationOperand;
  readonly magnitude: Decimal;
}

export interface ComputedValueMutationInput {
  readonly id: EntityId;
  readonly reason: string;
  readonly source: ComputedValueMutationOrigin;
  readonly operand: ComputedValueMutationOperand;
  readonly magnitude: Decimal;
}
