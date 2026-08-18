import type { Decimal } from "../common.js";

export type DiceCompiled =
  | { readonly kind: "constant"; readonly value: Decimal }
  | { readonly kind: "dice"; readonly count: number }
  | { readonly kind: "add" | "multiply"; readonly operands: readonly DiceCompiled[] }
  | {
      readonly kind: "subtract" | "divide";
      readonly left: DiceCompiled;
      readonly right: DiceCompiled;
    }
  | { readonly kind: "negate"; readonly operand: DiceCompiled };
