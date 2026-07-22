import assert from "node:assert/strict";
import test from "node:test";
import { Anatomy } from "../anatomy.js";
import { HitLocation } from "../hit-location.js";
const location = (id, hitOn) => {
    const result = HitLocation.create({ id, catalogKey: id, name: id, description: "", hitOn });
    assert.equal(result.ok, true);
    return result.value;
};
const anatomy = (hitLocations) => Anatomy.create({
    id: "human",
    catalogKey: "human",
    name: "Human",
    description: "",
    hitLocations,
});
test("Anatomy creates anatomy with non-overlapping locations", () => {
    const result = anatomy([location("torso", [9, 10]), location("arm", [8, 11])]);
    assert.equal(result.ok, true);
    assert.deepEqual(result.value.hitLocations.map((item) => item.id), ["torso", "arm"]);
});
test("Anatomy reports each overlapping pair and its shared hitOn values", () => {
    const result = anatomy([location("torso", [8, 9, 10]), location("arm", [8, 9]), location("leg", [10])]);
    assert.equal(result.ok, false);
    assert.deepEqual(result.error.conflicts, [
        { left: { id: "torso", name: "torso" }, right: { id: "arm", name: "arm" }, hitOn: [8, 9] },
        { left: { id: "torso", name: "torso" }, right: { id: "leg", name: "leg" }, hitOn: [10] },
    ]);
});
test("Anatomy does not add a conflicting location", () => {
    const created = anatomy([location("torso", [9])]);
    assert.equal(created.ok, true);
    assert.equal(created.value.addHitLocation(location("arm", [9])).ok, false);
    assert.deepEqual(created.value.hitLocations.map((item) => item.id), ["torso"]);
});
test("Anatomy does not replace locations with a conflicting list", () => {
    const created = anatomy([location("torso", [9])]);
    assert.equal(created.ok, true);
    assert.equal(created.value.setHitLocations([location("arm", [8]), location("leg", [8])]).ok, false);
    assert.deepEqual(created.value.hitLocations.map((item) => item.id), ["torso"]);
});
//# sourceMappingURL=anatomy.test.js.map