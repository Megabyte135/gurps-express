import type { CatalogKey, EntityId } from "../../common.js";
import type { Effect } from "../effects/effect.js";
export interface Condition {
    readonly id: EntityId;
    readonly catalogKey: CatalogKey;
    readonly name: string;
    readonly description: string;
    readonly iconUrl: string | null;
    readonly active: boolean;
    readonly effects: readonly Effect[];
}
//# sourceMappingURL=condition.d.ts.map