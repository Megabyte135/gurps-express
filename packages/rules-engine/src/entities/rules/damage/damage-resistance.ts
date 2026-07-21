import type { Result } from "../../common.js";
import type { HitLocation } from "../../character/anatomy/hit-location.js";
import type { DamageType } from "../damage-type.js";

export interface HitLocationDamageResistance {
  readonly hitLocation: HitLocation;
  readonly value: number;
}

export interface HitLocationDamageResistanceInput {
  readonly hitLocation: HitLocation;
  readonly value: number;
}

export interface DamageResistanceInput {
  readonly damageType: DamageType;
  readonly source: string;
  readonly hitLocationDamageResistances: readonly HitLocationDamageResistanceInput[];
}

export interface InvalidDamageResistanceValueError {
  readonly code: "invalid-damage-resistance-value";
  readonly message: string;
  readonly invalidValues: readonly unknown[];
}

export interface AggregatedHitLocationDamageResistance {
  readonly hitLocation: HitLocation;
  readonly value: number;
}

/** Damage resistance entries grouped by damage source and damage type. */
export class DamageResistance {
  readonly damageType: DamageType;
  readonly source: string;
  #entries: readonly HitLocationDamageResistance[];

  private constructor(input: DamageResistanceInput, entries: readonly HitLocationDamageResistance[]) {
    this.damageType = input.damageType;
    this.source = input.source;
    this.#entries = entries;
  }

  public static create(
    input: DamageResistanceInput,
  ): Result<DamageResistance, InvalidDamageResistanceValueError> {
    const validation = validateHitLocationDamageResistanceValues(input.hitLocationDamageResistances);
    if (!validation.ok) return validation;
    return {
      ok: true,
      value: new DamageResistance(input, validation.value),
    };
  }

  public get hitLocationDamageResistances(): readonly HitLocationDamageResistance[] {
    return [...this.#entries];
  }

  public setHitLocationDamageResistances(
    entries: readonly HitLocationDamageResistanceInput[],
  ): Result<void, InvalidDamageResistanceValueError> {
    const validation = validateHitLocationDamageResistanceValues(entries);
    if (!validation.ok) return validation;
    this.#entries = validation.value;
    return { ok: true, value: undefined };
  }

  public addHitLocationDamageResistance(
    entry: HitLocationDamageResistanceInput,
  ): Result<void, InvalidDamageResistanceValueError> {
    return this.setHitLocationDamageResistances([...this.#entries, entry]);
  }

  public getAggregatedDamageResistance(): readonly AggregatedHitLocationDamageResistance[] {
    const totals = new Map<string, AggregatedHitLocationDamageResistance>();

    for (const entry of this.#entries) {
      const current = totals.get(entry.hitLocation.id);
      if (current === undefined) {
        totals.set(entry.hitLocation.id, { ...entry });
        continue;
      }

      totals.set(entry.hitLocation.id, {
        ...current,
        value: current.value + entry.value,
      });
    }

    return [...totals.values()];
  }
}

function validateHitLocationDamageResistanceValues(
  entries: readonly HitLocationDamageResistanceInput[],
): Result<readonly HitLocationDamageResistance[], InvalidDamageResistanceValueError> {
  if (!Array.isArray(entries)) {
    return {
      ok: false,
      error: {
        code: "invalid-damage-resistance-value",
        message: "Damage resistance values must be an array.",
        invalidValues: [entries],
      },
    };
  }

  const invalidValues: unknown[] = [];
  const validEntries: HitLocationDamageResistance[] = [];

  for (const entry of entries) {
    if (!isPositiveNumber(entry.value)) {
      invalidValues.push(entry.value);
      continue;
    }

    validEntries.push(entry);
  }

  if (invalidValues.length > 0) {
    return {
      ok: false,
      error: {
        code: "invalid-damage-resistance-value",
        message: "Damage resistance value must be a positive number.",
        invalidValues,
      },
    };
  }

  return { ok: true, value: validEntries };
}

function isPositiveNumber(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}
