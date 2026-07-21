import type { Computable, Decimal, EntityId } from "../../common.js";
import type { Formula } from "../../formulas/formula.js";

export type EffectOperand = Extract<Formula["kind"], "add" | "multiply" | "divide">;

export interface Effect {
  readonly id: EntityId;
  readonly source: { readonly id: EntityId; readonly description: string };
  readonly description: string;
  readonly magnitude: Decimal;
  readonly operand: EffectOperand;
  /** Mutators apply to these computable entities by id/type. */
  readonly targets: readonly Computable[];
}
