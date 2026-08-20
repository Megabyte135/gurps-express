import assert from "node:assert/strict";
import test from "node:test";
import { SheetGroups } from "../sheet-groups.js";

const CHILDREN = [
  {
    kind: "group" as const,
    id: "g-racial",
    name: "Расовые черты",
    note: null,
    children: [
      { kind: "item" as const, entityId: "flight" },
      {
        kind: "group" as const,
        id: "g-senses",
        name: "Чувства",
        note: null,
        children: [{ kind: "item" as const, entityId: "night-vision" }],
      },
    ],
  },
  { kind: "item" as const, entityId: "magery" },
];

test("SheetGroups.create builds a valid tree and reports ungrouped entities", () => {
  const result = SheetGroups.create(["flight", "night-vision", "magery", "berserk"], CHILDREN);
  assert.equal(result.ok, true);
  if (!result.ok) return;

  const groups = result.value.groups();
  assert.equal(groups.length, 2);
  const racial = groups[0];
  assert.equal(racial.kind, "group");
  if (racial.kind === "group") {
    assert.equal(racial.name, "Расовые черты");
    assert.equal(racial.children.length, 2);
    const senses = racial.children[1];
    assert.equal(senses.kind, "group");
  }
  assert.deepEqual([...result.value.ungrouped()], ["berserk"]);
});

test("SheetGroups.create rejects references to unknown entities", () => {
  const result = SheetGroups.create(["flight"], CHILDREN);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.error.code, "unknown-entity");
});

test("SheetGroups.create rejects entities placed twice", () => {
  const duplicate = [
    { kind: "item" as const, entityId: "flight" },
    { kind: "item" as const, entityId: "flight" },
  ];
  const result = SheetGroups.create(["flight"], duplicate);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.error.code, "duplicate-entity");
});

test("SheetGroups.create rejects duplicate group ids and empty names", () => {
  const duplicatedIds = [
    { kind: "group" as const, id: "g", name: "A", note: null, children: [] },
    { kind: "group" as const, id: "g", name: "B", note: null, children: [] },
  ];
  const idsResult = SheetGroups.create([], duplicatedIds);
  assert.equal(idsResult.ok, false);
  if (!idsResult.ok) assert.equal(idsResult.error.code, "duplicate-group-id");

  const emptyName = [{ kind: "group" as const, id: "g", name: "  ", note: null, children: [] }];
  const nameResult = SheetGroups.create([], emptyName);
  assert.equal(nameResult.ok, false);
  if (!nameResult.ok) assert.equal(nameResult.error.code, "invalid-group-name");
});

test("addGroup and addItem place nodes under a parent and reject invalid ones", () => {
  const result = SheetGroups.create(["flight", "magery", "berserk"], []);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const groups = result.value;

  const folder = groups.addGroup(null, "g-main", "Главное");
  assert.equal(folder.ok, true);

  const placed = groups.addItem("g-main", "flight");
  assert.equal(placed.ok, true);
  assert.deepEqual([...groups.ungrouped()], ["magery", "berserk"]);

  const unknown = groups.addItem("g-main", "tail");
  assert.equal(unknown.ok, false);
  if (!unknown.ok) assert.equal(unknown.error.code, "unknown-entity");

  const twice = groups.addItem("g-main", "flight");
  assert.equal(twice.ok, false);
  if (!twice.ok) assert.equal(twice.error.code, "duplicate-entity");

  const missingParent = groups.addItem("g-nope", "magery");
  assert.equal(missingParent.ok, false);
  if (!missingParent.ok) assert.equal(missingParent.error.code, "group-not-found");
});

test("removeGroup ungroups the subtree; removeItem frees the entity", () => {
  const result = SheetGroups.create(["flight", "night-vision", "magery"], CHILDREN);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const groups = result.value;

  assert.equal(groups.removeGroup("g-senses"), true);
  assert.deepEqual([...groups.ungrouped()], ["night-vision"]);

  const rePlace = groups.addItem("g-racial", "night-vision");
  assert.equal(rePlace.ok, true);

  assert.equal(groups.removeItem("flight"), true);
  assert.deepEqual([...groups.ungrouped()], ["flight"]);
});

test("groups() snapshots are isolated from later mutations", () => {
  const result = SheetGroups.create(["flight"], [
    { kind: "group" as const, id: "g", name: "A", note: null, children: [] },
  ]);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const groups = result.value;

  const before = groups.groups();
  const added = groups.addItem("g", "flight");
  assert.equal(added.ok, true);

  const snapshotGroup = before[0];
  assert.equal(snapshotGroup.kind, "group");
  if (snapshotGroup.kind === "group") assert.equal(snapshotGroup.children.length, 0);

  const after = groups.groups()[0];
  assert.equal(after.kind, "group");
  if (after.kind === "group") assert.equal(after.children.length, 1);
});
