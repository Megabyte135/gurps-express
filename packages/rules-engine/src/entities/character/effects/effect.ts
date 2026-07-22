import type { Computable, Decimal, EntityId } from "../../common.js";
export type EffectOperand = "add" | "multiply" | "divide";

export interface Effect {
  readonly id: EntityId;
  readonly source: { readonly id: EntityId; readonly description: string };
  readonly description: string;
  readonly magnitude: Decimal;
  readonly operand: EffectOperand;
  /** Mutators apply to these computable entities by id/type. */
  readonly targets: readonly Computable[];
}
