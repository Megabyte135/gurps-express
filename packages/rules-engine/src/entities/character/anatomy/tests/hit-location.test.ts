import assert from "node:assert/strict";
import test from "node:test";
import { HitLocation } from "../hit-location.js";

const input = (hitOn: readonly number[]) => ({
  id: "torso",
  catalogKey: "torso",
  name: "Torso",
  description: "",
  hitOn,
});

test("HitLocation creates a hit location with boundary hitOn values", () => {
  const result = HitLocation.create(input([3, 18]));

  assert.equal(result.ok, true);
  assert.deepEqual(result.value.hitOn, [3, 18]);
});

test("HitLocation returns every invalid hitOn value without throwing", () => {
  const result = HitLocation.create(input([2, 3.5, 19, Number.NaN, Infinity]));

  assert.equal(result.ok, false);
  assert.equal(result.error.code, "invalid-hit-on");
  assert.deepEqual(result.error.invalidValues, [2, 3.5, 19, Number.NaN, Infinity]);
});

test("HitLocation does not change hitOn when setHitOn validation fails", () => {
  const created = HitLocation.create(input([9]));
  assert.equal(created.ok, true);

  assert.equal(created.value.setHitOn([2]).ok, false);
  assert.deepEqual(created.value.hitOn, [9]);
});

test("HitLocation returns defensive copies of hitOn", () => {
  const created = HitLocation.create(input([9]));
  assert.equal(created.ok, true);
  const hitOn = [...created.value.hitOn];
  hitOn.push(10);

  assert.deepEqual(created.value.hitOn, [9]);
});
