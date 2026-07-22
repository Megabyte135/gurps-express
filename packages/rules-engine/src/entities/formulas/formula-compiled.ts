import type { Decimal, TechnicalName } from "../common.js";

export type FormulaCompiled =
  | { readonly kind: "constant"; readonly value: Decimal }
  | { readonly kind: "reference"; readonly target: FormulaCompiledTarget }
  | { readonly kind: "add" | "multiply"; readonly operands: readonly FormulaCompiled[] }
  | {
      readonly kind: "subtract" | "divide" | "power";
      readonly left: FormulaCompiled;
      readonly right: FormulaCompiled;
    }
  | { readonly kind: "negate"; readonly operand: FormulaCompiled };

export type FormulaCompiledTarget =
  | { readonly kind: "attribute"; readonly technicalName: TechnicalName }
  | {
      readonly kind: "skill";
      readonly technicalName: TechnicalName;
      readonly value: "effective" | "trainingModifier" | "experience";
    }
  | { readonly kind: "variable"; readonly name: string };
