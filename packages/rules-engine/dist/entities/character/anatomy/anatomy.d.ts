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
export declare class Anatomy {
    #private;
    readonly id: EntityId;
    readonly catalogKey: CatalogKey;
    readonly name: string;
    readonly description: string;
    private constructor();
    static create(input: AnatomyInput): Result<Anatomy, OverlappingHitOnError>;
    get hitLocations(): readonly HitLocation[];
    setHitLocations(locations: readonly HitLocation[]): Result<void, OverlappingHitOnError>;
    addHitLocation(location: HitLocation): Result<void, OverlappingHitOnError>;
}
//# sourceMappingURL=anatomy.d.ts.map