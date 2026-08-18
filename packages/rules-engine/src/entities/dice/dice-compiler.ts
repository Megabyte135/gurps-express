import type { Decimal, Result } from "../common.js";
import type { DiceCompiled } from "./dice-compiled.js";
import type { DiceExpression } from "./dice-expression.js";

export interface DiceExpressionCompilationError {
  readonly code: "invalid-dice-expression";
  readonly message: string;
  readonly position: number;
}

export interface CompileDiceExpressionOptions {
  readonly allowMultiplicative: boolean;
}

export function compileDiceExpression(
  source: DiceExpression,
  options: CompileDiceExpressionOptions = { allowMultiplicative: true },
): Result<DiceCompiled, DiceExpressionCompilationError> {
  try {
    return { ok: true, value: new DiceExpressionCompiler(source, options).compile() };
  } catch (error) {
    if (!(error instanceof DiceExpressionCompilationFailure)) throw error;
    return {
      ok: false,
      error: {
        code: "invalid-dice-expression",
        message: error.message,
        position: error.position,
      },
    };
  }
}

type Token =
  | { readonly kind: "number"; readonly value: string; readonly position: number }
  | { readonly kind: "dice"; readonly count: number; readonly position: number }
  | { readonly kind: "operator"; readonly value: "+" | "-" | "*" | "/"; readonly position: number }
  | { readonly kind: "left-parenthesis" | "right-parenthesis" | "end"; readonly position: number };

class DiceExpressionCompiler {
  readonly #tokens: readonly Token[];
  readonly #allowMultiplicative: boolean;
  #position = 0;

  public constructor(source: DiceExpression, options: CompileDiceExpressionOptions) {
    this.#tokens = tokenize(source);
    this.#allowMultiplicative = options.allowMultiplicative;
  }

  public compile(): DiceCompiled {
    const expression = this.compileSum();
    if (this.current.kind !== "end") {
      throw new DiceExpressionCompilationFailure(
        "Unexpected token at the end of dice expression.",
        this.current.position,
      );
    }
    return expression;
  }

  private compileSum(): DiceCompiled {
    let expression = this.compileProduct();
    while (this.current.kind === "operator" && (this.current.value === "+" || this.current.value === "-")) {
      const operation = this.current.value;
      this.#position += 1;
      const right = this.compileProduct();
      expression = operation === "+"
        ? { kind: "add", operands: [expression, right] }
        : { kind: "subtract", left: expression, right };
    }
    return expression;
  }

  private compileProduct(): DiceCompiled {
    let expression = this.compileUnary();
    while (this.current.kind === "operator" && (this.current.value === "*" || this.current.value === "/")) {
      if (!this.#allowMultiplicative) {
        throw new DiceExpressionCompilationFailure(
          "Multiplicative modifiers cannot be applied to success rolls.",
          this.current.position,
        );
      }
      const operation = this.current.value;
      this.#position += 1;
      const right = this.compileUnary();
      expression = operation === "*"
        ? { kind: "multiply", operands: [expression, right] }
        : { kind: "divide", left: expression, right };
    }
    return expression;
  }

  private compileUnary(): DiceCompiled {
    if (this.current.kind === "operator" && this.current.value === "+") {
      this.#position += 1;
      return this.compileUnary();
    }
    if (this.current.kind === "operator" && this.current.value === "-") {
      this.#position += 1;
      return { kind: "negate", operand: this.compileUnary() };
    }
    return this.compilePrimary();
  }

  private compilePrimary(): DiceCompiled {
    const token = this.current;
    if (token.kind === "number") {
      this.#position += 1;
      return { kind: "constant", value: token.value as Decimal };
    }
    if (token.kind === "dice") {
      this.#position += 1;
      return { kind: "dice", count: token.count };
    }
    if (token.kind === "left-parenthesis") {
      this.#position += 1;
      const expression = this.compileSum();
      if (this.current.kind !== "right-parenthesis") {
        throw new DiceExpressionCompilationFailure(
          "A dice expression parenthesis is not closed.",
          this.current.position,
        );
      }
      this.#position += 1;
      return expression;
    }
    throw new DiceExpressionCompilationFailure(
      "Expected a number, dice, or parenthesized expression.",
      token.position,
    );
  }

  private get current(): Token {
    const token = this.#tokens[this.#position];
    if (token === undefined) {
      throw new DiceExpressionCompilationFailure("Unexpected end of dice expression.", this.#tokens.length);
    }
    return token;
  }
}

function tokenize(source: DiceExpression): readonly Token[] {
  const tokens: Token[] = [];
  let position = 0;
  while (position < source.length) {
    const character = source.charAt(position);
    if (/\s/.test(character)) {
      position += 1;
      continue;
    }
    if ("+-*/".includes(character)) {
      tokens.push({
        kind: "operator",
        value: character as "+" | "-" | "*" | "/",
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

    const dice = source.slice(position).match(/^(\d+)[dD](\d*)/);
    if (dice?.[0] !== undefined) {
      const count = Number.parseInt(dice[1] as string, 10);
      const sides = dice[2] ?? "";
      if (sides !== "" && sides !== "6") {
        throw new DiceExpressionCompilationFailure("Only six-sided dice (Nd6) are supported.", position);
      }
      if (count < 1) {
        throw new DiceExpressionCompilationFailure("A dice group must contain at least one die.", position);
      }
      tokens.push({ kind: "dice", count, position });
      position += dice[0].length;
      continue;
    }

    const number = source.slice(position).match(/^\d+(?:\.\d+)?/);
    if (number?.[0] !== undefined) {
      if (number[0].includes(".")) {
        throw new DiceExpressionCompilationFailure("Dice expression modifiers must be integers.", position);
      }
      tokens.push({ kind: "number", value: number[0], position });
      position += number[0].length;
      continue;
    }

    if (character === "d" || character === "D") {
      throw new DiceExpressionCompilationFailure(
        `A dice count is required before ${character}6 (for example, 3d6).`,
        position,
      );
    }

    throw new DiceExpressionCompilationFailure(
      `Unexpected character in dice expression: ${character}.`,
      position,
    );
  }
  tokens.push({ kind: "end", position });
  return tokens;
}

class DiceExpressionCompilationFailure extends Error {
  public constructor(message: string, readonly position: number) {
    super(message);
  }
}
