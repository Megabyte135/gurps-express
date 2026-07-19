import type { CatalogKey, Decimal, JsonValue } from "../../common.js";
import type { Formula } from "../../formulas/formula.js";
import type { ChangeTrackedValue } from "../../values/change-tracked-value.js";
import type { AttributeImprovementRule } from "./attribute-improvement-rule.js";
/**
 * One configurable attribute. It is used unchanged in CharacterPreset and
 * in Character; character-specific values populate `value`.
 */
export interface CharacterAttribute {
    readonly id: string;
    readonly catalogKey: CatalogKey;
    readonly kind: "primary" | "secondary";
    readonly name: string;
    readonly description: string;
    readonly tags: readonly string[];
    readonly minimumValue: Decimal;
    readonly maximumValue: Decimal | null;
    /** Primary attributes store their fixed baseline; secondary ones use a formula. */
    readonly calculation: Formula | null;
    readonly positiveImprovement: AttributeImprovementRule;
    readonly negativeImprovement: AttributeImprovementRule;
    readonly settings: Readonly<Record<string, JsonValue>>;
    readonly value: ChangeTrackedValue;
}
//# sourceMappingURL=attribute.d.ts.map