import assert from "node:assert/strict";
import test from "node:test";
import { ComputedValue } from "../computed-value.js";
const constant = (value) => value;
test("ComputedValue applies mutations to a constant formula", () => {
    const value = new ComputedValue({ baseValue: constant("10"), changesList: [] }, constantResolver);
    value.applyMutation({ id: "training", reason: "Training", source: { kind: "manual", id: null, description: "Character sheet" }, operand: "add", magnitude: "2" });
    assert.equal(value.value, "12");
});
test("ComputedValue recalculates when a formula dependency changes", () => {
    let strength = "10";
    const resolver = {
        resolve: (formula) => formula === "attr.ST" ? strength : formula,
    };
    const value = new ComputedValue({
        baseValue: "attr.ST",
        changesList: [],
    }, resolver);
    assert.equal(value.value, "10");
    strength = "12";
    assert.equal(value.value, "12");
});
test("ComputedValue preserves changes when its base formula is replaced", () => {
    const value = new ComputedValue({ baseValue: constant("10"), changesList: [] }, constantResolver);
    value.applyMutation({ id: "bonus", reason: "Bonus", source: { kind: "manual", id: null, description: "Character sheet" }, operand: "multiply", magnitude: "2" });
    value.rebase(constant("12"));
    assert.equal(value.value, "24");
    assert.deepEqual(value.toSnapshot().baseValue, constant("12"));
});
const constantResolver = {
    resolve: (formula) => formula,
};
//# sourceMappingURL=computed-value.test.js.map