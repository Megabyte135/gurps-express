import assert from "node:assert/strict";
import test from "node:test";
import { compileDiceExpression } from "../dice-compiler.js";

test("compileDiceExpression compiles dice groups and arithmetic", () => {
  assert.deepEqual(compileDiceExpression("3d6"), {
    ok: true,
    value: { kind: "dice", count: 3 },
  });
  assert.deepEqual(compileDiceExpression("3d"), {
    ok: true,
    value: { kind: "dice", count: 3 },
  });
  assert.deepEqual(compileDiceExpression("2D6"), {
    ok: true,
    value: { kind: "dice", count: 2 },
  });
  assert.deepEqual(compileDiceExpression("1d6 + 2"), {
    ok: true,
    value: {
      kind: "add",
      operands: [{ kind: "dice", count: 1 }, { kind: "constant", value: "2" }],
    },
  });
  assert.deepEqual(compileDiceExpression("1 + 2 * 3"), {
    ok: true,
    value: {
      kind: "add",
      operands: [
        { kind: "constant", value: "1" },
        {
          kind: "multiply",
          operands: [{ kind: "constant", value: "2" }, { kind: "constant", value: "3" }],
        },
      ],
    },
  });
});

test("compileDiceExpression reports positioned errors", () => {
  const failure = compileDiceExpression("1 + d6");
  assert.ok(!failure.ok);
  assert.equal(failure.error.code, "invalid-dice-expression");
  assert.equal(failure.error.position, 4);
  assert.match(failure.error.message, /count/);

  assert.match(errorOf("3d20").message, /six-sided/);
  assert.match(errorOf("0d6").message, /at least one die/);
  assert.match(errorOf("(2d6 + 3").message, /not closed/);
  assert.match(errorOf("2d6 3").message, /end of dice expression/);
  assert.match(errorOf("2d6 & 3").message, /Unexpected character/);
  assert.match(errorOf("1.5 + 2d6").message, /integers/);
});

test("compileDiceExpression can reject multiplicative operators", () => {
  const options = { allowMultiplicative: false };

  assert.ok(!compileDiceExpression("2 * 3", options).ok);
  assert.ok(!compileDiceExpression("6 / 2", options).ok);
  assert.ok(compileDiceExpression("2 * 3").ok);
});

function errorOf(source: string) {
  const result = compileDiceExpression(source);
  assert.ok(!result.ok);
  return result.error;
}
