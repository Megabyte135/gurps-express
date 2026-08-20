import assert from "node:assert/strict";
import test from "node:test";
import { BodyMap } from "../body-map.js";
import { createAnatomyFromBlueprint, humanoidBlueprint } from "../index.js";

test("BodyMap rejects polygons with too few points", () => {
  const result = BodyMap.create({
    id: "map",
    catalogKey: "body-map.test",
    name: "Test",
    description: "",
    canvas: { width: 1000, height: 2000, imageUrl: null },
    zones: [
      {
        id: "zone",
        hitLocationId: "torso",
        label: null,
        polygon: [{ x: 0, y: 0 }, { x: 100, y: 0 }],
        subzones: [],
      },
    ],
  });

  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.error.code, "polygon-too-few-points");
});

test("BodyMap rejects out-of-bounds polygons", () => {
  const result = BodyMap.create({
    id: "map",
    catalogKey: "body-map.test",
    name: "Test",
    description: "",
    canvas: { width: 1000, height: 2000, imageUrl: null },
    zones: [
      {
        id: "zone",
        hitLocationId: "torso",
        label: null,
        polygon: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 1200, y: 50 }],
        subzones: [],
      },
    ],
  });

  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.error.code, "polygon-out-of-bounds");
});

test("BodyMap rejects duplicate zone ids", () => {
  const result = BodyMap.create({
    id: "map",
    catalogKey: "body-map.test",
    name: "Test",
    description: "",
    canvas: { width: 1000, height: 2000, imageUrl: null },
    zones: [
      {
        id: "zone",
        hitLocationId: "torso",
        label: null,
        polygon: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 100 }],
        subzones: [],
      },
      {
        id: "zone",
        hitLocationId: "skull",
        label: null,
        polygon: [{ x: 200, y: 0 }, { x: 300, y: 0 }, { x: 250, y: 100 }],
        subzones: [],
      },
    ],
  });

  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.error.code, "duplicate-zone-id");
});

test("humanoid blueprint creates an anatomy with an attached body map", () => {
  const result = createAnatomyFromBlueprint(humanoidBlueprint);
  assert.equal(result.ok, true);
  if (!result.ok) return;

  const anatomy = result.value;
  assert.equal(anatomy.hitLocations.length, 13);
  assert.notEqual(anatomy.bodyMap, null);
  assert.equal(anatomy.bodyMap?.zones.length, 15);
});

test("humanoid blueprint zones reference only known hit locations", () => {
  const result = createAnatomyFromBlueprint(humanoidBlueprint);
  assert.equal(result.ok, true);
  if (!result.ok) return;

  const anatomy = result.value;
  const knownIds = new Set(anatomy.hitLocations.map((location) => location.id));

  const visit = (zones: readonly { hitLocationId: string; subzones: readonly unknown[] }[]): void => {
    for (const zone of zones) {
      assert.ok(knownIds.has(zone.hitLocationId), `Zone references unknown location ${zone.hitLocationId}`);
      visit(zone.subzones as readonly { hitLocationId: string; subzones: readonly unknown[] }[]);
    }
  };

  visit(anatomy.bodyMap?.zones ?? []);
});

test("humanoid blueprint covers every 3-18 roll except aimed-only gaps", () => {
  const result = createAnatomyFromBlueprint(humanoidBlueprint);
  assert.equal(result.ok, true);
  if (!result.ok) return;

  const anatomy = result.value;
  for (let roll = 3; roll <= 18; roll += 1) {
    const found = anatomy.findHitLocation(roll);
    assert.equal(found.ok, true);
    if (found.ok) {
      if (roll === 3 || roll === 4) assert.equal(found.value?.id, "skull");
      else if (roll === 5) assert.equal(found.value?.id, "face");
      else if (roll === 6 || roll === 7) assert.equal(found.value?.id, "leg-right");
      else if (roll === 8) assert.equal(found.value?.id, "arm-right");
      else if (roll === 9 || roll === 10) assert.equal(found.value?.id, "torso");
      else if (roll === 11) assert.equal(found.value?.id, "vitals");
      else if (roll === 12) assert.equal(found.value?.id, "arm-left");
      else if (roll === 13 || roll === 14) assert.equal(found.value?.id, "leg-left");
      else if (roll === 15) assert.equal(found.value?.id, "hand");
      else if (roll === 16) assert.equal(found.value?.id, "foot");
      else if (roll === 17 || roll === 18) assert.equal(found.value?.id, "neck");
    }
  }
});

test("findHitLocation rejects rolls outside 3-18", () => {
  const result = createAnatomyFromBlueprint(humanoidBlueprint);
  assert.equal(result.ok, true);
  if (!result.ok) return;

  for (const roll of [2, 19, 10.5]) {
    const found = result.value.findHitLocation(roll);
    assert.equal(found.ok, false);
    if (!found.ok) assert.equal(found.error.code, "invalid-hit-location-roll");
  }
});

test("setBodyMap rejects zones referencing unknown hit locations", () => {
  const result = createAnatomyFromBlueprint(humanoidBlueprint);
  assert.equal(result.ok, true);
  if (!result.ok) return;

  const mapResult = BodyMap.create({
    id: "map-foreign",
    catalogKey: "body-map.test",
    name: "Foreign",
    description: "",
    canvas: { width: 1000, height: 2000, imageUrl: null },
    zones: [
      {
        id: "zone-tail",
        hitLocationId: "tail",
        label: null,
        polygon: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 100 }],
        subzones: [],
      },
    ],
  });
  assert.equal(mapResult.ok, true);
  if (!mapResult.ok) return;

  const attachment = result.value.setBodyMap(mapResult.value);
  assert.equal(attachment.ok, false);
  if (!attachment.ok) assert.equal(attachment.error.code, "unknown-hit-location");
});
