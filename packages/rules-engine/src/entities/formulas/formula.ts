import type { Decimal, EntityId } from "../common.js";

/** Declarative expression evaluated by the rules engine. */
export type Formula =
  | { readonly kind: "constant"; readonly value: Decimal }
  | { readonly kind: "reference"; readonly target: FormulaTarget }
  | { readonly kind: "add" | "multiply" | "minimum" | "maximum"; readonly operands: readonly Formula[] }
  | { readonly kind: "subtract" | "divide" | "power"; readonly left: Formula; readonly right: Formula }
  | { readonly kind: "negate" | "absolute" | "floor" | "ceil" | "round" | "fibonacci"; readonly operand: Formula };

export type FormulaTarget =
  | { readonly kind: "attribute"; readonly attributeId: EntityId; readonly value: "base" | "improvement" | "effective" }
  | { readonly kind: "skill"; readonly skillId: EntityId; readonly value: "base" | "improvement" | "effective" | "experience" }
  | { readonly kind: "resource"; readonly resourceId: EntityId; readonly value: "current" | "minimum" | "maximum" }
  | { readonly kind: "variable"; readonly name: FormulaVariable };

export type FormulaVariable = "level" | "difficulty" | "experience" | "trainingModifier";

export type FormulaVariables = Readonly<Partial<Record<FormulaVariable, Decimal>>>;
