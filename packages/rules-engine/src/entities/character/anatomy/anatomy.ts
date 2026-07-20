import type { CatalogKey, EntityId, Result } from "../../common.js";
import { HitLocation } from "./hit-location.js";

export interface AnatomyInput {
  readonly id: EntityId;
  readonly catalogKey: CatalogKey;
  readonly name: string;
  readonly description: string;
  readonly hitLocations: readonly HitLocation[];
}

export interface HitLocationConflict {
  readonly left: Pick<HitLocation, "id" | "name">;
  readonly right: Pick<HitLocation, "id" | "name">;
  readonly hitOn: readonly number[];
}

export interface OverlappingHitOnError {
  readonly code: "overlapping-hit-on";
  readonly message: string;
  readonly conflicts: readonly HitLocationConflict[];
}

/** The copied anatomy determines the complete set of available hit locations. */
export class Anatomy {
  readonly id: EntityId;
  readonly catalogKey: CatalogKey;
  readonly name: string;
  readonly description: string;
  #hitLocations: readonly HitLocation[];

  private constructor(input: AnatomyInput) {
    this.id = input.id;
    this.catalogKey = input.catalogKey;
    this.name = input.name;
    this.description = input.description;
    this.#hitLocations = input.hitLocations;
  }

  public static create(input: AnatomyInput): Result<Anatomy, OverlappingHitOnError> {
    const validation = validateHitLocationIntersections(input.hitLocations);
    if (!validation.ok) return validation;
    return { ok: true, value: new Anatomy({ ...input, hitLocations: validation.value }) };
  }

  public get hitLocations(): readonly HitLocation[] {
    return [...this.#hitLocations];
  }

  public setHitLocations(locations: readonly HitLocation[]): Result<void, OverlappingHitOnError> {
    const validation = validateHitLocationIntersections(locations);
    if (!validation.ok) return validation;
    this.#hitLocations = validation.value;
    return { ok: true, value: undefined };
  }

  public addHitLocation(location: HitLocation): Result<void, OverlappingHitOnError> {
    return this.setHitLocations([...this.#hitLocations, location]);
  }
}

function validateHitLocationIntersections(
  locations: readonly HitLocation[],
): Result<readonly HitLocation[], OverlappingHitOnError> {
  const conflicts: HitLocationConflict[] = [];

  for (let leftIndex = 0; leftIndex < locations.length; leftIndex += 1) {
    const left = locations[leftIndex];
    if (left === undefined) continue;
    const leftRolls = new Set(left.hitOn);

    for (let rightIndex = leftIndex + 1; rightIndex < locations.length; rightIndex += 1) {
      const right = locations[rightIndex];
      if (right === undefined) continue;
      const sharedRolls = [...new Set(right.hitOn)]
        .filter((roll) => leftRolls.has(roll))
        .sort((first, second) => first - second);
      if (sharedRolls.length > 0) {
        conflicts.push({
          left: { id: left.id, name: left.name },
          right: { id: right.id, name: right.name },
          hitOn: sharedRolls,
        });
      }
    }
  }

  if (conflicts.length === 0) return { ok: true, value: [...locations] };

  const details = conflicts
    .map((conflict) => `${describe(conflict.left)} and ${describe(conflict.right)}: ${conflict.hitOn.join(", ")}`)
    .join("; ");
  return {
    ok: false,
    error: {
      code: "overlapping-hit-on",
      message: `Hit location hitOn values overlap: ${details}.`,
      conflicts,
    },
  };
}

function describe(location: Pick<HitLocation, "id" | "name">): string {
  return `"${location.name}" (${location.id})`;
}
