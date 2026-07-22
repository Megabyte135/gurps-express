/** Canonical decimal text. It is parsed and validated at the system boundary. */
export type Decimal = string;
/** UUID string identifying an entity embedded in an aggregate. */
export type EntityId = string;
/** Stable, English identifier unique within the relevant character entity list. */
export type TechnicalName = string;
export type EntityType = string;
/** Base identity for any persisted object in the character aggregate. */
export declare abstract class Entity {
    #private;
    readonly id: EntityId;
    abstract readonly type: EntityType;
    protected constructor(id: EntityId, technicalName: TechnicalName);
    get technicalName(): TechnicalName;
    set technicalName(value: TechnicalName);
}
/** An entity that owns `ComputedValue` field. */
export interface Computable extends Entity {
}
/** A stable key copied from a catalog entity. It is not a catalog link. */
export type CatalogKey = string;
/** Success or failure returned by domain operations that can be invalid. */
export type Result<T, E> = {
    readonly ok: true;
    readonly value: T;
} | {
    readonly ok: false;
    readonly error: E;
};
/** JSON accepted in catalog-owned extension points after schema validation. */
export type JsonValue = boolean | null | number | string | readonly JsonValue[] | {
    readonly [key: string]: JsonValue;
};
/** JSON Schema is data-only so catalog data remains platform independent. */
export type JsonSchema = Readonly<Record<string, JsonValue>>;
//# sourceMappingURL=common.d.ts.map