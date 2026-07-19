import type { CatalogKey, EntityId } from "../common.js";
import type { HitLocation } from "./hit-location.js";
/** The copied anatomy determines the complete set of available hit locations. */
export interface Anatomy {
    readonly id: EntityId;
    readonly catalogKey: CatalogKey;
    readonly name: string;
    readonly description: string;
    readonly hitLocations: readonly HitLocation[];
}
//# sourceMappingURL=anatomy.d.ts.map