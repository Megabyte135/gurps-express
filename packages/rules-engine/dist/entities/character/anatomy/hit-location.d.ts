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
export declare class HitLocation {
    #private;
    readonly id: EntityId;
    readonly catalogKey: CatalogKey;
    readonly name: string;
    readonly description: string;
    private constructor();
    static create(input: HitLocationInput): Result<HitLocation, InvalidHitOnError>;
    get hitOn(): readonly number[];
    setHitOn(values: readonly number[]): Result<void, InvalidHitOnError>;
}
//# sourceMappingURL=hit-location.d.ts.map