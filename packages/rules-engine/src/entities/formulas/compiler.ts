import type { Decimal, Result, TechnicalName } from "../common.js";
import type { FormulaCompiled, FormulaCompiledTarget } from "./formula-compiled.js";
import type { Formula } from "./formula.js";

export interface FormulaCompilationError {
  readonly code: "invalid-formula";
  readonly message: string;
  readonly position: number;
}

export function compileFormula(source: Formula): Result<FormulaCompiled, FormulaCompilationError> {
  try {
    return { ok: true, value: new FormulaCompiler(source).compile() };
  } catch (error) {
    if (!(error instanceof FormulaCompilationFailure)) throw error;
    return {
      ok: false,
      error: {
        code: "invalid-formula",
        message: error.message,
        position: error.position,
      },
    };
  }
}

type Token =
  | { readonly kind: "number"; readonly value: string; readonly position: number }
  | { readonly kind: "reference"; readonly value: string; readonly position: number }
  | { readonly kind: "operator"; readonly value: "+" | "-" | "*" | "/" | "^"; readonly position: number }
  | { readonly kind: "left-parenthesis" | "right-parenthesis" | "end"; readonly position: number };

class FormulaCompiler {
  readonly #tokens: readonly Token[];
  #position = 0;

  public constructor(source: Formula) {
    this.#tokens = tokenize(source);
  }

  public compile(): FormulaCompiled {
    const formula = this.compileSum();
    if (this.current.kind !== "end") {
      throw new FormulaCompilationFailure("Unexpected token at the end of formula.", this.current.position);
    }
    return formula;
  }

  private compileSum(): FormulaCompiled {
    let formula = this.compileProduct();
    while (this.current.kind === "operator" && (this.current.value === "+" || this.current.value === "-")) {
      const operation = this.current.value;
      this.#position += 1;
      const right = this.compileProduct();
      formula = operation === "+"
        ? { kind: "add", operands: [formula, right] }
        : { kind: "subtract", left: formula, right };
    }
    return formula;
  }

  private compileProduct(): FormulaCompiled {
    let formula = this.compileUnary();
    while (this.current.kind === "operator" && (this.current.value === "*" || this.current.value === "/")) {
      const operation = this.current.value;
      this.#position += 1;
      const right = this.compileUnary();
      formula = operation === "*"
        ? { kind: "multiply", operands: [formula, right] }
        : { kind: "divide", left: formula, right };
    }
    return formula;
  }

  private compileUnary(): FormulaCompiled {
    if (this.current.kind === "operator" && this.current.value === "+") {
      this.#position += 1;
      return this.compileUnary();
    }
    if (this.current.kind === "operator" && this.current.value === "-") {
      this.#position += 1;
      return { kind: "negate", operand: this.compileUnary() };
    }
    return this.compilePower();
  }

  private compilePower(): FormulaCompiled {
    const left = this.compilePrimary();
    if (this.current.kind !== "operator" || this.current.value !== "^") return left;
    this.#position += 1;
    return { kind: "power", left, right: this.compileUnary() };
  }

  private compilePrimary(): FormulaCompiled {
    const token = this.current;
    if (token.kind === "number") {
      this.#position += 1;
      return { kind: "constant", value: token.value as Decimal };
    }
    if (token.kind === "reference") {
      this.#position += 1;
      return { kind: "reference", target: compileTarget(token) };
    }
    if (token.kind === "left-parenthesis") {
      this.#position += 1;
      const formula = this.compileSum();
      if (this.current.kind !== "right-parenthesis") {
        throw new FormulaCompilationFailure("A formula parenthesis is not closed.", this.current.position);
      }
      this.#position += 1;
      return formula;
    }
    throw new FormulaCompilationFailure("Expected a number, reference, or parenthesized expression.", token.position);
  }

  private get current(): Token {
    const token = this.#tokens[this.#position];
    if (token === undefined) {
      throw new FormulaCompilationFailure("Unexpected end of formula.", this.#tokens.length);
    }
    return token;
  }
}

function compileTarget(token: Extract<Token, { readonly kind: "reference" }>): FormulaCompiledTarget {
  if (token.value.startsWith("$")) {
    return { kind: "variable", name: token.value.slice(1) };
  }

  const parts = token.value.split(".");
  const technicalName = parts[1];
  const hasValidTechnicalName = technicalName !== undefined && /^[A-Za-z][A-Za-z0-9_]*$/.test(technicalName);
  if (parts[0] === "attr" && parts.length === 2 && hasValidTechnicalName) {
    return { kind: "attribute", technicalName: technicalName as TechnicalName };
  }
  if (parts[0] === "skill" && hasValidTechnicalName && (parts.length === 2 || parts.length === 3)) {
    const value = parts[2] ?? "effective";
    if (value === "effective" || value === "trainingModifier" || value === "experience") {
      return { kind: "skill", technicalName: technicalName as TechnicalName, value };
    }
    throw new FormulaCompilationFailure(`Skill field ${value} is not supported.`, token.position);
  }
  if (parts.length === 1) {
    throw new FormulaCompilationFailure(`Formula variable ${token.value} must start with $.`, token.position);
  }
  throw new FormulaCompilationFailure(`Invalid formula reference: ${token.value}.`, token.position);
}

function tokenize(source: Formula): readonly Token[] {
  const tokens: Token[] = [];
  let position = 0;
  while (position < source.length) {
    const character = source.charAt(position);
    if (/\s/.test(character)) {
      position += 1;
      continue;
    }
    if ("+-*/^".includes(character)) {
      tokens.push({
        kind: "operator",
        value: character as "+" | "-" | "*" | "/" | "^",
        position,
      });
      position += 1;
      continue;
    }
    if (character === "(") {
      tokens.push({ kind: "left-parenthesis", position });
      position += 1;
      continue;
    }
    if (character === ")") {
      tokens.push({ kind: "right-parenthesis", position });
      position += 1;
      continue;
    }

    const number = source.slice(position).match(/^\d+(?:\.\d+)?/);
    if (number?.[0] !== undefined) {
      tokens.push({ kind: "number", value: number[0], position });
      position += number[0].length;
      continue;
    }

    const reference = source.slice(position).match(/^\$[A-Za-z_][A-Za-z0-9_]*|^[A-Za-z][A-Za-z0-9_.]*/);
    if (reference?.[0] !== undefined) {
      tokens.push({ kind: "reference", value: reference[0], position });
      position += reference[0].length;
      continue;
    }

    throw new FormulaCompilationFailure(`Unexpected character in formula: ${character}.`, position);
  }
  tokens.push({ kind: "end", position });
  return tokens;
}

class FormulaCompilationFailure extends Error {
  public constructor(message: string, readonly position: number) {
    super(message);
  }
}
