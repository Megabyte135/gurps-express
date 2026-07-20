import type { CatalogKey, EntityId, Result } from "../../common.js";

export interface HitLocationInput {
  readonly id: EntityId;
  readonly catalogKey: CatalogKey;
  readonly name: string;
  readonly description: string;
  readonly hitOn: readonly number[];
}

export interface InvalidHitOnError {
  readonly code: "invalid-hit-on";
  readonly message: string;
  readonly invalidValues: readonly unknown[];
}

/**
 * A location that can be hit by one or more 3d6 results.
 *
 * `hitOn` is changed through `setHitOn`, so invalid roll values cannot enter
 * the domain model after construction.
 */
export class HitLocation {
  readonly id: EntityId;
  readonly catalogKey: CatalogKey;
  readonly name: string;
  readonly description: string;
  #hitOn: readonly number[];

  private constructor(input: HitLocationInput) {
    this.id = input.id;
    this.catalogKey = input.catalogKey;
    this.name = input.name;
    this.description = input.description;
    this.#hitOn = input.hitOn;
  }

  public static create(input: HitLocationInput): Result<HitLocation, InvalidHitOnError> {
    const validation = validateHitOn(input.hitOn);
    if (!validation.ok) return validation;
    return { ok: true, value: new HitLocation({ ...input, hitOn: validation.value }) };
  }

  public get hitOn(): readonly number[] {
    return [...this.#hitOn];
  }

  public setHitOn(values: readonly number[]): Result<void, InvalidHitOnError> {
    const validation = validateHitOn(values);
    if (!validation.ok) return validation;
    this.#hitOn = validation.value;
    return { ok: true, value: undefined };
  }
}

function validateHitOn(values: readonly number[]): Result<readonly number[], InvalidHitOnError> {
  if (!Array.isArray(values)) {
    return {
      ok: false,
      error: {
        code: "invalid-hit-on",
        message: "Hit location hitOn must be an array of 3d6 results.",
        invalidValues: [values],
      },
    };
  }

  const invalidValues = values.filter((value) => !Number.isInteger(value) || value < 3 || value > 18);
  if (invalidValues.length > 0) {
    return {
      ok: false,
      error: {
        code: "invalid-hit-on",
        message: `Hit location hitOn values must be integers from 3 to 18; received ${invalidValues.join(", ")}.`,
        invalidValues,
      },
    };
  }

  return { ok: true, value: [...values] };
}
