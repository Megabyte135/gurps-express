import assert from "node:assert/strict";
import test from "node:test";
import { DiceRoller } from "../dice-roller.js";
import type { DiceRollResult, SuccessRollResult } from "../dice-roller.js";
import type { RandomSource } from "../random-source.js";

class SequenceRandomSource implements RandomSource {
  readonly #values: readonly number[];
  #position = 0;

  public constructor(values: readonly number[]) {
    this.#values = values;
  }

  public nextInt(): number {
    const value = this.#values[this.#position];
    if (value === undefined) {
      throw new Error(`The random source was exhausted at position ${this.#position}.`);
    }
    this.#position += 1;
    return value;
  }
}

const rollerWith = (values: readonly number[]): DiceRoller => new DiceRoller(new SequenceRandomSource(values));

function asRoll(result: DiceRollResult | SuccessRollResult): DiceRollResult {
  assert.equal(result.kind, "roll");
  return result as DiceRollResult;
}

function asSuccess(result: DiceRollResult | SuccessRollResult): SuccessRollResult {
  assert.equal(result.kind, "success");
  return result as SuccessRollResult;
}

test("DiceRoller rolls dice groups and reports dice in roll order", () => {
  const result = rollerWith([4, 2, 6]).roll("3d6");

  assert.ok(result.ok);
  assert.equal(result.value.kind, "roll");
  assert.equal(result.value.expression, "3d6");
  assert.deepEqual(result.value.dice, [
    { index: 0, value: 4 },
    { index: 1, value: 2 },
    { index: 2, value: 6 },
  ]);
  assert.equal(result.value.total, "12");
});

test("DiceRoller applies integer bonuses and penalties", () => {
  const bonus = rollerWith([2, 2, 2]).roll("3d6 + 5");
  assert.ok(bonus.ok);
  assert.equal(bonus.value.total, "11");

  const penalty = rollerWith([4, 4, 4]).roll("3d6 - 4");
  assert.ok(penalty.ok);
  assert.equal(penalty.value.total, "8");
});

test("DiceRoller multiplies and divides totals, rounding division down", () => {
  const multiplied = rollerWith([2, 5]).roll("2d6 * 3");
  assert.ok(multiplied.ok);
  assert.equal(multiplied.value.total, "21");

  const divided = rollerWith([3, 4, 6]).roll("3d6 / 2");
  assert.ok(divided.ok);
  assert.equal(divided.value.total, "6");

  const negative = rollerWith([6, 6]).roll("(2d6 - 20) / 3");
  assert.ok(negative.ok);
  assert.equal(negative.value.total, "-3");
});

test("DiceRoller accepts dice and formulas as modifiers", () => {
  const result = rollerWith([1, 2, 3, 4, 5]).roll("3d6 + 2d6");
  assert.ok(result.ok);
  assert.deepEqual(result.value.dice.map((die) => die.value), [1, 2, 3, 4, 5]);
  assert.equal(result.value.total, "15");

  const formula = rollerWith([6, 3]).roll("(2d6 + 4) / 2");
  assert.ok(formula.ok);
  assert.equal(formula.value.total, "6");
});

test("DiceRoller honors arithmetic precedence", () => {
  const result = rollerWith([4]).roll("1d6 + 2 * 3");
  assert.ok(result.ok);
  assert.equal(result.value.total, "10");
});

test("DiceRoller reports division by zero as an evaluation error", () => {
  const result = rollerWith([1, 1, 1, 3, 4]).roll("3d6 / (2d6 - 7)");
  assert.ok(!result.ok);
  assert.equal(result.error.code, "division-by-zero");
});

test("DiceRoller rolls success against a target with a signed margin", () => {
  const success = rollerWith([5, 3, 2]).rollSuccess("14");
  assert.ok(success.ok);
  assert.equal(success.value.total, "10");
  assert.equal(success.value.margin, "4");
  assert.equal(success.value.outcome, "success");

  const failure = rollerWith([6, 5, 4]).rollSuccess("8");
  assert.ok(failure.ok);
  assert.equal(failure.value.margin, "-7");
  assert.equal(failure.value.outcome, "failure");

  const exact = rollerWith([3, 4, 5]).rollSuccess("10", "-2");
  assert.ok(exact.ok);
  assert.equal(exact.value.total, "10");
  assert.equal(exact.value.margin, "0");
  assert.equal(exact.value.outcome, "success");
});

test("DiceRoller accepts dice in success modifiers and always reports dice", () => {
  const result = rollerWith([4, 2, 3, 6]).rollSuccess("12", "+1d6 - 1");
  assert.ok(result.ok);
  assert.deepEqual(result.value.dice.map((die) => die.value), [4, 2, 3, 6]);
  assert.equal(result.value.total, "14");
  assert.equal(result.value.margin, "-2");
  assert.equal(result.value.outcome, "failure");
});

test("DiceRoller rejects multiplicative success modifiers and invalid targets", () => {
  const multiplied = rollerWith([]).rollSuccess("10", "2 * 3");
  assert.ok(!multiplied.ok);
  assert.equal(multiplied.error.code, "invalid-dice-expression");
  assert.match(multiplied.error.message, /Multiplicative/);

  const divided = rollerWith([]).rollSuccess("10", "6 / 2");
  assert.ok(!divided.ok);
  assert.match(divided.error.message, /Multiplicative/);

  const target = rollerWith([]).rollSuccess("high");
  assert.ok(!target.ok);
  assert.equal(target.error.code, "invalid-target");
});

test("DiceRoller rerolls only the selected dice and recomputes the formula", () => {
  const roller = rollerWith([2, 2, 2, 2, 6, 5, 4]);

  const first = roller.roll("3d6 + 1d6");
  assert.ok(first.ok);
  assert.equal(first.value.total, "8");

  const second = roller.reroll(first.value, [0, 3]);
  assert.ok(second.ok);
  const rerolled = asRoll(second.value);
  assert.deepEqual(rerolled.dice.map((die) => die.value), [6, 2, 2, 5]);
  assert.equal(rerolled.total, "15");
  assert.equal(rerolled.expression, "3d6 + 1d6");

  const third = roller.reroll(second.value, [1]);
  assert.ok(third.ok);
  assert.deepEqual(asRoll(third.value).dice.map((die) => die.value), [6, 4, 2, 5]);
  assert.equal(asRoll(third.value).total, "17");
});

test("DiceRoller rerolls success rolls and can flip the outcome", () => {
  const roller = rollerWith([6, 6, 6, 1, 1]);

  const first = roller.rollSuccess("12");
  assert.ok(first.ok);
  assert.equal(first.value.total, "18");
  assert.equal(first.value.outcome, "failure");

  const second = roller.reroll(first.value, [0, 1]);
  assert.ok(second.ok);
  const rerolled = asSuccess(second.value);
  assert.deepEqual(rerolled.dice.map((die) => die.value), [1, 1, 6]);
  assert.equal(rerolled.total, "8");
  assert.equal(rerolled.margin, "4");
  assert.equal(rerolled.outcome, "success");
  assert.equal(rerolled.target, "12");
});

test("DiceRoller keeps unselected dice exactly on reroll", () => {
  const roller = rollerWith([3, 4, 6]);

  const first = roller.roll("2d6 * 2");
  assert.ok(first.ok);
  assert.equal(first.value.total, "14");

  const second = roller.reroll(first.value, [1]);
  assert.ok(second.ok);
  assert.deepEqual(asRoll(second.value).dice.map((die) => die.value), [3, 6]);
  assert.equal(asRoll(second.value).total, "18");
});

test("DiceRoller rejects invalid reroll indices", () => {
  const roller = rollerWith([1, 2, 3, 4]);
  const roll = roller.roll("4d6");
  assert.ok(roll.ok);

  for (const indices of [[4], [-1], [0, 0], [0.5]]) {
    const result = roller.reroll(roll.value, indices);
    assert.ok(!result.ok, `indices ${indices.join(",")} must be rejected`);
    assert.equal(result.error.code, "invalid-reroll-indices");
  }
});

test("DiceRoller reports dice expression compilation errors", () => {
  for (const expression of ["d6", "3d20", "0d6", "2d6 +", "(1d6 + 2", "1.5 + 2d6", "2d6 & 1"]) {
    const result = rollerWith([]).roll(expression);
    assert.ok(!result.ok, `${expression} must be rejected`);
    assert.equal(result.error.code, "invalid-dice-expression");
  }
});

test("DiceRoller defaults to a cryptographic random source", () => {
  const result = new DiceRoller().roll("2d6");
  assert.ok(result.ok);
  for (const die of result.value.dice) {
    assert.ok(die.value >= 1 && die.value <= 6);
  }
  const sum = result.value.dice.reduce((total, die) => total + die.value, 0);
  assert.equal(result.value.total, String(sum));
});
