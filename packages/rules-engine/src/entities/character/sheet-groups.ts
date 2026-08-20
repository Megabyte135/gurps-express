import type { EntityId, Result } from "../common.js";

/** A reference to a catalog or character entity placed inside a group. */
export interface SheetItemRef {
  readonly kind: "item";
  readonly entityId: EntityId;
}

/** A folder node; may nest groups and item references in order. */
export interface SheetGroupNode {
  readonly kind: "group";
  readonly id: EntityId;
  readonly name: string;
  readonly note: string | null;
  readonly children: readonly (SheetGroupNode | SheetItemRef)[];
}

export type SheetGroupChildInput = SheetGroupInput | SheetItemRefInput;

export interface SheetItemRefInput {
  readonly kind: "item";
  readonly entityId: EntityId;
}

export interface SheetGroupInput {
  readonly kind: "group";
  readonly id: EntityId;
  readonly name: string;
  readonly note: string | null;
  readonly children: readonly SheetGroupChildInput[];
}

export interface UnknownEntityError {
  readonly code: "unknown-entity";
  readonly message: string;
  readonly entityIds: readonly EntityId[];
}

export interface DuplicateEntityError {
  readonly code: "duplicate-entity";
  readonly message: string;
  readonly entityId: EntityId;
}

export interface DuplicateGroupIdError {
  readonly code: "duplicate-group-id";
  readonly message: string;
  readonly groupId: EntityId;
}

export interface GroupNotFoundError {
  readonly code: "group-not-found";
  readonly message: string;
  readonly groupId: EntityId;
}

export interface InvalidGroupNameError {
  readonly code: "invalid-group-name";
  readonly message: string;
  readonly name: string;
}

export type SheetGroupsError =
  | UnknownEntityError
  | DuplicateEntityError
  | DuplicateGroupIdError
  | GroupNotFoundError
  | InvalidGroupNameError;

interface MutableGroup {
  readonly kind: "group";
  readonly id: EntityId;
  name: string;
  note: string | null;
  readonly children: (MutableGroup | SheetItemRef)[];
}

const isItem = (child: SheetGroupChildInput): child is SheetItemRefInput => child.kind === "item";

/**
 * Player-defined folder tree over sheet entries (traits, skills, spells).
 * The engine validates structure: every item reference must exist, each
 * entity is placed at most once, and group ids are unique. Entities that are
 * not placed in any group are reported by `ungrouped`.
 */
export class SheetGroups {
  readonly #items: ReadonlySet<EntityId>;
  readonly #groups: Map<EntityId, MutableGroup>;
  readonly #roots: (MutableGroup | SheetItemRef)[];

  private constructor(items: readonly EntityId[], roots: (MutableGroup | SheetItemRef)[]) {
    this.#items = new Set(items);
    this.#groups = new Map();
    const register = (node: MutableGroup | SheetItemRef): void => {
      if (node.kind === "item") return;
      this.#groups.set(node.id, node);
      for (const child of node.children) register(child);
    };
    for (const root of roots) register(root);
    this.#roots = roots;
  }

  public static create(
    items: readonly EntityId[],
    children: readonly SheetGroupChildInput[],
  ): Result<SheetGroups, SheetGroupsError> {
    const known = new Set(items);
    const groupIds = new Set<EntityId>();
    const placed = new Set<EntityId>();
    const roots: (MutableGroup | SheetItemRef)[] = [];

    const buildGroup = (input: SheetGroupInput): Result<MutableGroup, SheetGroupsError> => {
      if (groupIds.has(input.id)) {
        return {
          ok: false,
          error: {
            code: "duplicate-group-id",
            message: `Sheet group ids must be unique; duplicate: ${input.id}.`,
            groupId: input.id,
          },
        };
      }
      groupIds.add(input.id);
      if (input.name.trim() === "") {
        return {
          ok: false,
          error: {
            code: "invalid-group-name",
            message: "Sheet group name must not be empty.",
            name: input.name,
          },
        };
      }

      const group: MutableGroup = {
        kind: "group",
        id: input.id,
        name: input.name,
        note: input.note,
        children: [],
      };
      for (const child of input.children) {
        const built = isItem(child) ? buildItem(child) : buildGroup(child);
        if (!built.ok) return built;
        group.children.push(built.value);
      }
      return { ok: true, value: group };
    };

    const buildItem = (input: SheetItemRefInput): Result<SheetItemRef, SheetGroupsError> => {
      if (!known.has(input.entityId)) {
        return {
          ok: false,
          error: {
            code: "unknown-entity",
            message: `Sheet group references unknown entity: ${input.entityId}.`,
            entityIds: [input.entityId],
          },
        };
      }
      if (placed.has(input.entityId)) {
        return {
          ok: false,
          error: {
            code: "duplicate-entity",
            message: `Sheet entity is placed more than once: ${input.entityId}.`,
            entityId: input.entityId,
          },
        };
      }
      placed.add(input.entityId);
      return { ok: true, value: { kind: "item", entityId: input.entityId } };
    };

    for (const child of children) {
      const built = isItem(child) ? buildItem(child) : buildGroup(child);
      if (!built.ok) return built;
      roots.push(built.value);
    }

    return { ok: true, value: new SheetGroups(items, roots) };
  }

  /** Deep snapshot of the root children; safe to hand to consumers. */
  public groups(): readonly (SheetGroupNode | SheetItemRef)[] {
    return this.#roots.map((root) => this.#snapshot(root));
  }

  /** Entities known to the sheet but not placed in any group, in order. */
  public ungrouped(): readonly EntityId[] {
    const placed = new Set(this.#placedIds());
    return [...this.#items].filter((id) => !placed.has(id));
  }

  /** Creates a new group under `parentGroupId` (null = root level). */
  public addGroup(
    parentGroupId: EntityId | null,
    id: EntityId,
    name: string,
    note: string | null = null,
  ): Result<SheetGroupNode, SheetGroupsError> {
    if (this.#groups.has(id)) {
      return {
        ok: false,
        error: {
          code: "duplicate-group-id",
          message: `Sheet group ids must be unique; duplicate: ${id}.`,
          groupId: id,
        },
      };
    }
    if (name.trim() === "") {
      return {
        ok: false,
        error: {
          code: "invalid-group-name",
          message: "Sheet group name must not be empty.",
          name,
        },
      };
    }

    const group: MutableGroup = { kind: "group", id, name, note, children: [] };
    const parent = parentGroupId === null ? null : this.#groups.get(parentGroupId);
    if (parentGroupId !== null && parent === undefined) {
      return {
        ok: false,
        error: {
          code: "group-not-found",
          message: `Sheet group not found: ${parentGroupId}.`,
          groupId: parentGroupId,
        },
      };
    }

    this.#groups.set(id, group);
    (parent ?? ({ kind: "group", children: this.#roots } as MutableGroup)).children.push(group);
    return { ok: true, value: this.#snapshot(group) as SheetGroupNode };
  }

  /** Places an entity under `parentGroupId` (null = root level). */
  public addItem(
    parentGroupId: EntityId | null,
    entityId: EntityId,
  ): Result<void, SheetGroupsError> {
    if (!this.#items.has(entityId)) {
      return {
        ok: false,
        error: {
          code: "unknown-entity",
          message: `Sheet group references unknown entity: ${entityId}.`,
          entityIds: [entityId],
        },
      };
    }
    const parent = parentGroupId === null ? null : this.#groups.get(parentGroupId);
    if (parentGroupId !== null && parent === undefined) {
      return {
        ok: false,
        error: {
          code: "group-not-found",
          message: `Sheet group not found: ${parentGroupId}.`,
          groupId: parentGroupId,
        },
      };
    }
    const placed = new Set(this.#placedIds());
    if (placed.has(entityId)) {
      return {
        ok: false,
        error: {
          code: "duplicate-entity",
          message: `Sheet entity is placed more than once: ${entityId}.`,
          entityId,
        },
      };
    }

    (parent ?? ({ kind: "group", children: this.#roots } as MutableGroup)).children.push({
      kind: "item",
      entityId,
    });
    return { ok: true, value: undefined };
  }

  /** Removes a group (its subtree) from the tree; children become ungrouped. */
  public removeGroup(groupId: EntityId): boolean {
    const removeFrom = (list: (MutableGroup | SheetItemRef)[]): boolean => {
      const index = list.findIndex((child) => child.kind === "group" && child.id === groupId);
      if (index >= 0) {
        list.splice(index, 1);
        return true;
      }
      return list.some((child) => child.kind === "group" && removeFrom(child.children));
    };

    if (!this.#groups.has(groupId)) return false;
    if (removeFrom(this.#roots)) {
      this.#collectGroupIds(this.#groups.get(groupId)).forEach((id) => this.#groups.delete(id));
      return true;
    }
    return false;
  }

  /** Removes an entity reference from wherever it is placed. */
  public removeItem(entityId: EntityId): boolean {
    const removeFrom = (list: (MutableGroup | SheetItemRef)[]): boolean => {
      const index = list.findIndex((child) => child.kind === "item" && child.entityId === entityId);
      if (index >= 0) {
        list.splice(index, 1);
        return true;
      }
      return list.some((child) => child.kind === "group" && removeFrom(child.children));
    };

    return removeFrom(this.#roots);
  }

  #placedIds(): readonly EntityId[] {
    const ids: EntityId[] = [];
    const walk = (list: readonly (MutableGroup | SheetItemRef)[]): void => {
      for (const child of list) {
        if (child.kind === "item") ids.push(child.entityId);
        else walk(child.children);
      }
    };
    walk(this.#roots);
    return ids;
  }

  #collectGroupIds(group: MutableGroup | undefined): readonly EntityId[] {
    if (group === undefined) return [];
    const ids: EntityId[] = [group.id];
    for (const child of group.children) {
      if (child.kind === "group") ids.push(...this.#collectGroupIds(child));
    }
    return ids;
  }

  #snapshot(node: MutableGroup | SheetItemRef): SheetGroupNode | SheetItemRef {
    if (node.kind === "item") return { ...node };
    return {
      kind: "group",
      id: node.id,
      name: node.name,
      note: node.note,
      children: node.children.map((child) => this.#snapshot(child)),
    };
  }
}
