import type { CatalogKey, EntityId } from "../../common.js";
import type { Formula } from "../../formulas/formula.js";
import type { Effect } from "../effects/effect.js";
import type { ChangeTrackedValue } from "../../values/change-tracked-value.js";
import type { Threshold } from "./threshold.js";
export interface Resource {
    readonly id: EntityId;
    readonly catalogKey: CatalogKey;
    readonly name: string;
    readonly description: string;
    readonly currentFormula: Formula;
    readonly minimumFormula: Formula;
    readonly maximumFormula: Formula;
    readonly currentValue: ChangeTrackedValue;
    readonly minimumValue: ChangeTrackedValue;
    readonly maximumValue: ChangeTrackedValue;
    readonly thresholds: readonly Threshold[];
    readonly effects: readonly Effect[];
}
//# sourceMappingURL=resource.d.ts.map