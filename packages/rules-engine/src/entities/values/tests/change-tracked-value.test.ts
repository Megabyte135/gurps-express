import assert from "node:assert/strict";
import test from "node:test";
import { ChangeTrackedValue, type FormulaResolver } from "../change-tracked-value.js";

const constant = (value: string) => ({ kind: "constant" as const, value });

test("ChangeTrackedValue applies changes to a constant formula", () => {
  const value = new ChangeTrackedValue({ baseValue: constant("10"), changesList: [] }, constantResolver);
  value.change({ id: "training", reason: "Training", source: { kind: "manual", id: null, description: "Character sheet" }, operand: "add", magnitude: "2" });
  assert.equal(value.value, "12");
});

test("ChangeTrackedValue recalculates when a formula dependency changes", () => {
  let strength = "10";
  const resolver: FormulaResolver = {
    resolve: (formula) => {
      if (formula.kind === "reference") return strength;
      if (formula.kind === "constant") return formula.value;
      throw new Error("Unexpected formula.");
    },
  };
  const value = new ChangeTrackedValue({
    baseValue: { kind: "reference", target: { kind: "attribute", attributeId: "st", value: "effective" } },
    changesList: [],
  }, resolver);

  assert.equal(value.value, "10");
  strength = "12";
  assert.equal(value.value, "12");
});

test("ChangeTrackedValue preserves changes when its base formula is replaced", () => {
  const value = new ChangeTrackedValue({ baseValue: constant("10"), changesList: [] }, constantResolver);
  value.change({ id: "bonus", reason: "Bonus", source: { kind: "manual", id: null, description: "Character sheet" }, operand: "multiply", magnitude: "2" });
  value.rebase(constant("12"));
  assert.equal(value.value, "24");
  assert.deepEqual(value.toSnapshot().baseValue, constant("12"));
});

const constantResolver: FormulaResolver = {
  resolve: (formula) => {
    if (formula.kind !== "constant") throw new Error("Unexpected formula.");
    return formula.value;
  },
};
