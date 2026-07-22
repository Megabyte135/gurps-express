import type { CatalogKey, Entity } from "../../common.js";
import type { Effect } from "../effects/effect.js";
export interface Condition extends Entity {
    readonly catalogKey: CatalogKey;
    readonly type: "condition";
    readonly name: string;
    readonly description: string;
    readonly iconUrl: string | null;
    readonly active: boolean;
    readonly effects: readonly Effect[];
}
//# sourceMappingURL=condition.d.ts.map