import type { Decimal, Result } from "../common.js";
import {
  addDecimals,
  compareDecimals,
  floorDivideDecimals,
  multiplyDecimals,
  normalizeDecimal,
  subtractDecimals,
} from "../decimal.js";
import { compileDiceExpression } from "./dice-compiler.js";
import type { DiceExpressionCompilationError } from "./dice-compiler.js";
import type { DiceCompiled } from "./dice-compiled.js";
import type { DiceExpression } from "./dice-expression.js";
import { CryptoRandomSource } from "./random-source.js";
import type { RandomSource } from "./random-source.js";

/** One six-sided die result with its global index within the owning roll. */
export interface DieRoll {
  readonly index: number;
  readonly value: number;
}

/** Outcome of a success roll: rolled at or under the target, or over it. */
export type SuccessRollOutcome = "success" | "failure";

/** Result of a regular dice roll. `dice` is in roll order and never sorted. */
export interface DiceRollResult {
  readonly kind: "roll";
  readonly expression: DiceExpression;
  readonly dice: readonly DieRoll[];
  readonly total: Decimal;
}

/**
 * Result of a 3d6 success roll. `margin` is `target - total`, positive on a
 * success and negative on a failure; a margin of zero is a success.
 */
export interface SuccessRollResult {
  readonly kind: "success";
  readonly target: Decimal;
  readonly modifiers: DiceExpression;
  readonly dice: readonly DieRoll[];
  readonly total: Decimal;
  readonly margin: Decimal;
  readonly outcome: SuccessRollOutcome;
}

export interface DiceEvaluationError {
  readonly code: "division-by-zero";
  readonly message: string;
}

/** Errors that can be produced while rolling or rerolling dice expressions. */
export type DiceRollError = DiceExpressionCompilationError | DiceEvaluationError;

export interface InvalidSuccessTargetError {
  readonly code: "invalid-target";
  readonly message: string;
}

export type SuccessRollError = DiceRollError | InvalidSuccessTargetError;

export interface InvalidRerollIndicesError {
  readonly code: "invalid-reroll-indices";
  readonly message: string;
  readonly invalidIndices: readonly number[];
}

export type RerollError = DiceRollError | InvalidRerollIndicesError;

/** Rolls dice expressions: plain rolls, 3d6 success rolls, and rerolls. */
export class DiceRoller {
  readonly #random: RandomSource;

  public constructor(random: RandomSource = new CryptoRandomSource()) {
    this.#random = random;
  }

  /**
   * Rolls any number of six-sided dice with integer, dice, and formula
   * modifiers. Division always rounds down.
   */
  public roll(expression: DiceExpression): Result<DiceRollResult, DiceRollError> {
    const compilation = compileDiceExpression(expression);
    if (!compilation.ok) return compilation;
    const evaluation = this.#evaluate(compilation.value, () => this.#random.nextInt(1, 6));
    if (!evaluation.ok) return evaluation;
    return {
      ok: true,
      value: {
        kind: "roll",
        expression,
        dice: evaluation.value.dice,
        total: evaluation.value.total,
      },
    };
  }

  /**
   * Rolls 3d6 against `target`. Modifiers accept dice and integer bonuses and
   * penalties; multiplicative modifiers are rejected.
   */
  public rollSuccess(target: Decimal, modifiers: DiceExpression = ""): Result<SuccessRollResult, SuccessRollError> {
    let normalizedTarget: Decimal;
    try {
      normalizedTarget = normalizeDecimal(target);
    } catch {
      return {
        ok: false,
        error: { code: "invalid-target", message: `Invalid success roll target: ${target}.` },
      };
    }
    const compilation = compileSuccessFormula(modifiers);
    if (!compilation.ok) return compilation;
    const evaluation = this.#evaluate(compilation.value, () => this.#random.nextInt(1, 6));
    if (!evaluation.ok) return evaluation;
    return {
      ok: true,
      value: buildSuccessResult(normalizedTarget, modifiers, evaluation.value.dice, evaluation.value.total),
    };
  }

  /**
   * Rerolls the dice at `indices` of a completed roll once more; every other
   * die keeps its value and the whole formula is evaluated again.
   */
  public reroll(
    previous: DiceRollResult | SuccessRollResult,
    indices: readonly number[],
  ): Result<DiceRollResult | SuccessRollResult, RerollError> {
    const validation = validateRerollIndices(indices, previous.dice.length);
    if (!validation.ok) return validation;

    const rerolled = new Set(indices);
    const keptValues = new Map(previous.dice.map((die) => [die.index, die.value] as const));
    const rollDie = (index: number): number => {
      if (rerolled.has(index)) return this.#random.nextInt(1, 6);
      const value = keptValues.get(index);
      if (value === undefined) throw new Error(`Die ${index} is missing from the previous roll.`);
      return value;
    };

    if (previous.kind === "roll") {
      const compilation = compileDiceExpression(previous.expression);
      if (!compilation.ok) return compilation;
      const evaluation = this.#evaluate(compilation.value, rollDie);
      if (!evaluation.ok) return evaluation;
      return {
        ok: true,
        value: {
          kind: "roll",
          expression: previous.expression,
          dice: evaluation.value.dice,
          total: evaluation.value.total,
        },
      };
    }

    const compilation = compileSuccessFormula(previous.modifiers);
    if (!compilation.ok) return compilation;
    const evaluation = this.#evaluate(compilation.value, rollDie);
    if (!evaluation.ok) return evaluation;
    return {
      ok: true,
      value: buildSuccessResult(
        previous.target,
        previous.modifiers,
        evaluation.value.dice,
        evaluation.value.total,
      ),
    };
  }

  #evaluate(formula: DiceCompiled, rollDie: (index: number) => number): Result<Evaluation, DiceEvaluationError> {
    const dice: DieRoll[] = [];
    let nextIndex = 0;
    const walk = (node: DiceCompiled): Decimal => {
      switch (node.kind) {
        case "constant":
          return node.value;
        case "dice": {
          let sum: Decimal = "0";
          for (let die = 0; die < node.count; die += 1) {
            const value = rollDie(nextIndex);
            dice.push({ index: nextIndex, value });
            nextIndex += 1;
            sum = addDecimals(sum, String(value));
          }
          return sum;
        }
        case "add":
          return node.operands.reduce<Decimal>((value, operand) => addDecimals(value, walk(operand)), "0");
        case "multiply":
          return node.operands.reduce<Decimal>((value, operand) => multiplyDecimals(value, walk(operand)), "1");
        case "subtract":
          return subtractDecimals(walk(node.left), walk(node.right));
        case "divide": {
          const left = walk(node.left);
          const right = walk(node.right);
          if (compareDecimals(right, "0") === 0) {
            throw new DiceEvaluationFailure("A dice expression cannot divide by zero.");
          }
          return floorDivideDecimals(left, right);
        }
        case "negate":
          return subtractDecimals("0", walk(node.operand));
      }
    };
    try {
      return { ok: true, value: { total: walk(formula), dice } };
    } catch (error) {
      if (!(error instanceof DiceEvaluationFailure)) throw error;
      return { ok: false, error: { code: "division-by-zero", message: error.message } };
    }
  }
}

interface Evaluation {
  readonly total: Decimal;
  readonly dice: readonly DieRoll[];
}

function compileSuccessFormula(modifiers: DiceExpression): Result<DiceCompiled, DiceExpressionCompilationError> {
  if (modifiers.trim() === "") return { ok: true, value: { kind: "dice", count: 3 } };
  const compilation = compileDiceExpression(modifiers, { allowMultiplicative: false });
  if (!compilation.ok) return compilation;
  return {
    ok: true,
    value: { kind: "add", operands: [{ kind: "dice", count: 3 }, compilation.value] },
  };
}

function buildSuccessResult(
  target: Decimal,
  modifiers: DiceExpression,
  dice: readonly DieRoll[],
  total: Decimal,
): SuccessRollResult {
  const margin = subtractDecimals(target, total);
  return {
    kind: "success",
    target,
    modifiers,
    dice,
    total,
    margin,
    outcome: compareDecimals(margin, "0") >= 0 ? "success" : "failure",
  };
}

function validateRerollIndices(
  indices: readonly number[],
  dieCount: number,
): Result<void, InvalidRerollIndicesError> {
  const seen = new Set<number>();
  const invalidIndices: number[] = [];
  for (const index of indices) {
    if (!Number.isInteger(index) || index < 0 || index >= dieCount || seen.has(index)) {
      invalidIndices.push(index);
      continue;
    }
    seen.add(index);
  }
  if (invalidIndices.length > 0) {
    return {
      ok: false,
      error: {
        code: "invalid-reroll-indices",
        message: `Reroll indices must be unique integers between 0 and ${dieCount - 1}.`,
        invalidIndices,
      },
    };
  }
  return { ok: true, value: undefined };
}

class DiceEvaluationFailure extends Error {}
