import assert from "node:assert/strict";
import test from "node:test";
import { Attribute } from "../attribute.js";
import { ChangeTrackedValue, type FormulaResolver } from "../../../values/change-tracked-value.js";

const constant = (value: string) => ({ kind: "constant" as const, value });
const resolver: FormulaResolver = {
  resolve: (formula) => {
    if (formula.kind !== "constant") throw new Error("Unexpected formula.");
    return formula.value;
  },
};

const value = () => new ChangeTrackedValue({ baseValue: constant("10"), changesList: [] }, resolver);
const rule = { maximumLevel: "0", costFormula: constant("0") };

const input = () => ({
  id: "strength",
  catalogKey: "st",
  name: "Strength",
  description: "",
  tags: [],
  minValue: "0",
  maximumValue: null,
  calculation: null,
  positiveImprovement: rule,
  negativeImprovement: rule,
  value: value(),
});

test("Attribute derives its kind from calculation", () => {
  const attribute = new Attribute(input());
  assert.equal(attribute.kind, "primary");

  attribute.calculation = constant("12");
  assert.equal(attribute.kind, "secondary");
  assert.equal(attribute.value.value, "12");

  attribute.calculation = null;
  assert.equal(attribute.kind, "primary");
});

test("Attribute rejects a negative minimum value without changing it", () => {
  const attribute = new Attribute(input());

  assert.throws(() => { attribute.minValue = "-1"; }, RangeError);
  assert.equal(attribute.minValue, "0");
});
