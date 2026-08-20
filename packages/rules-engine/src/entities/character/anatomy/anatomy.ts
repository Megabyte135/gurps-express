import type { CatalogKey, EntityId, Result } from "../../common.js";
import type { BodyMapInput, BodyMapError, BodyMapZone } from "./body-map.js";
import { BodyMap } from "./body-map.js";
import { HitLocation } from "./hit-location.js";
import type { HitLocationInput, InvalidHitOnError } from "./hit-location.js";

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

export interface UnknownHitLocationError {
  readonly code: "unknown-hit-location";
  readonly message: string;
  readonly unknownHitLocationIds: readonly EntityId[];
}

export interface InvalidHitLocationRollError {
  readonly code: "invalid-hit-location-roll";
  readonly message: string;
  readonly roll: number;
}

/**
 * Plain-data anatomy template with an optional body map. Catalog presets are
 * expressed as blueprints and instantiated per character.
 */
export interface AnatomyBlueprint {
  readonly id: EntityId;
  readonly catalogKey: CatalogKey;
  readonly name: string;
  readonly description: string;
  readonly hitLocations: readonly HitLocationInput[];
  readonly bodyMap: BodyMapInput | null;
}

export type AnatomyBlueprintError =
  | InvalidHitOnError
  | OverlappingHitOnError
  | BodyMapError
  | UnknownHitLocationError;

/** The copied anatomy determines the complete set of available hit locations. */
export class Anatomy {
  readonly id: EntityId;
  readonly catalogKey: CatalogKey;
  readonly name: string;
  readonly description: string;
  #hitLocations: readonly HitLocation[];
  #bodyMap: BodyMap | null = null;

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

  public get bodyMap(): BodyMap | null {
    return this.#bodyMap;
  }

  public setHitLocations(
    locations: readonly HitLocation[],
  ): Result<void, OverlappingHitOnError | UnknownHitLocationError> {
    const validation = validateHitLocationIntersections(locations);
    if (!validation.ok) return validation;
    this.#hitLocations = validation.value;
    if (this.#bodyMap !== null) {
      const revalidation = validateBodyMapReferences(this.#bodyMap, this.#hitLocations);
      if (!revalidation.ok) {
        this.#bodyMap = null;
        return revalidation;
      }
    }
    return { ok: true, value: undefined };
  }

  public addHitLocation(
    location: HitLocation,
  ): Result<void, OverlappingHitOnError | UnknownHitLocationError> {
    return this.setHitLocations([...this.#hitLocations, location]);
  }

  /** Attaches a body map; every zone must reference a known hit location. */
  public setBodyMap(bodyMap: BodyMap): Result<void, UnknownHitLocationError> {
    const validation = validateBodyMapReferences(bodyMap, this.#hitLocations);
    if (!validation.ok) return validation;
    this.#bodyMap = bodyMap;
    return { ok: true, value: undefined };
  }

  /**
   * Finds the hit location a 3d6 roll lands on. Locations with an empty
   * `hitOn` (aimed-only locations such as the eye) never match; a table gap
   * yields `null`.
   */
  public findHitLocation(roll: number): Result<HitLocation | null, InvalidHitLocationRollError> {
    if (!Number.isInteger(roll) || roll < 3 || roll > 18) {
      return {
        ok: false,
        error: {
          code: "invalid-hit-location-roll",
          message: `Hit location roll must be an integer from 3 to 18; received ${roll}.`,
          roll,
        },
      };
    }
    const location = this.#hitLocations.find((item) => item.hitOn.includes(roll)) ?? null;
    return { ok: true, value: location };
  }
}

export function createAnatomyFromBlueprint(
  blueprint: AnatomyBlueprint,
): Result<Anatomy, AnatomyBlueprintError> {
  const hitLocations: HitLocation[] = [];
  for (const input of blueprint.hitLocations) {
    const creation = HitLocation.create(input);
    if (!creation.ok) return creation;
    hitLocations.push(creation.value);
  }

  const anatomyResult = Anatomy.create({
    id: blueprint.id,
    catalogKey: blueprint.catalogKey,
    name: blueprint.name,
    description: blueprint.description,
    hitLocations,
  });
  if (!anatomyResult.ok) return anatomyResult;
  const anatomy = anatomyResult.value;

  if (blueprint.bodyMap !== null) {
    const mapResult = BodyMap.create(blueprint.bodyMap);
    if (!mapResult.ok) return mapResult;
    const attachment = anatomy.setBodyMap(mapResult.value);
    if (!attachment.ok) return attachment;
  }

  return { ok: true, value: anatomy };
}

function validateBodyMapReferences(
  bodyMap: BodyMap,
  hitLocations: readonly HitLocation[],
): Result<void, UnknownHitLocationError> {
  const knownIds = new Set(hitLocations.map((location) => location.id));

  const collectIds = (zones: readonly BodyMapZone[]): EntityId[] =>
    zones.flatMap((zone) => [zone.hitLocationId, ...collectIds(zone.subzones)]);

  const unknown = [...new Set(collectIds(bodyMap.zones))].filter((id) => !knownIds.has(id));
  if (unknown.length > 0) {
    return {
      ok: false,
      error: {
        code: "unknown-hit-location",
        message: `Body map zones reference unknown hit locations: ${unknown.join(", ")}.`,
        unknownHitLocationIds: unknown,
      },
    };
  }
  return { ok: true, value: undefined };
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
