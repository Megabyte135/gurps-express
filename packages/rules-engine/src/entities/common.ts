/** Canonical decimal text. It is parsed and validated at the system boundary. */
export type Decimal = string;

/** UUID string identifying an entity embedded in an aggregate. */
export type EntityId = string;

/** Stable, English identifier unique within the relevant character entity list. */
export type TechnicalName = string;

export type EntityType = string;

/** Base identity for any persisted object in the character aggregate. */
export abstract class Entity {
  readonly id: EntityId;
  abstract readonly type: EntityType;
  #technicalName: TechnicalName;

  protected constructor(id: EntityId, technicalName: TechnicalName) {
    this.id = id;
    this.#technicalName = assertTechnicalName(technicalName);
  }

  public get technicalName(): TechnicalName {
    return this.#technicalName;
  }

  public set technicalName(value: TechnicalName) {
    this.#technicalName = assertTechnicalName(value);
  }
}

/** An entity that owns `ComputedValue` field. */
export interface Computable extends Entity {}

function assertTechnicalName(value: TechnicalName): TechnicalName {
  if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(value)) {
    throw new Error("technicalName must be English, start with a letter, and contain no spaces.");
  }
  return value;
}

/** A stable key copied from a catalog entity. It is not a catalog link. */
export type CatalogKey = string;

/** Success or failure returned by domain operations that can be invalid. */
export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

/** JSON accepted in catalog-owned extension points after schema validation. */
export type JsonValue =
  | boolean
  | null
  | number
  | string
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

/** JSON Schema is data-only so catalog data remains platform independent. */
export type JsonSchema = Readonly<Record<string, JsonValue>>;
