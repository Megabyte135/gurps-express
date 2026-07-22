import { Entity, type CatalogKey, type Computable, type Decimal, type EntityId, type TechnicalName } from "../../common.js";
import type { Formula } from "../../formulas/formula.js";
import { ComputedValue } from "../../values/computed-value.js";
import type { AttributeImprovementRule } from "./attribute-improvement-rule.js";
export interface AttributeInput {
    readonly id: EntityId;
    readonly technicalName: TechnicalName;
    readonly catalogKey: CatalogKey;
    readonly name: string;
    readonly description: string;
    readonly tags: readonly string[];
    readonly minValue: Decimal;
    readonly maximumValue: Decimal | null;
    readonly calculation: Formula | null;
    readonly positiveImprovement: AttributeImprovementRule;
    readonly negativeImprovement: AttributeImprovementRule;
    readonly value: ComputedValue;
}
/** One configurable attribute shared by character presets and characters. */
export declare class Attribute extends Entity implements Computable {
    #private;
    readonly type: "attribute";
    readonly catalogKey: CatalogKey;
    readonly name: string;
    readonly description: string;
    readonly tags: readonly string[];
    readonly maximumValue: Decimal | null;
    readonly positiveImprovement: AttributeImprovementRule;
    readonly negativeImprovement: AttributeImprovementRule;
    constructor(input: AttributeInput);
    get kind(): "primary" | "secondary";
    get minValue(): Decimal;
    set minValue(value: Decimal);
    get calculation(): Formula | null;
    set calculation(value: Formula | null);
    get value(): ComputedValue;
    set value(value: ComputedValue);
}
//# sourceMappingURL=attribute.d.ts.map