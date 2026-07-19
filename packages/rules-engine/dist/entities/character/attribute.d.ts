import type { Decimal, JsonValue } from "../common.js";
import type { CatalogRef } from "./catalog-ref.js";
export interface AttributeCost {
    readonly pointsPerIncrement: Decimal;
    readonly increment: Decimal;
}
/**
 * One configurable attribute. It is used unchanged in CharacterRuleset and
 * in Character; character-specific values populate `value`.
 */
export interface CharacterAttribute {
    readonly id: string;
    readonly catalogRef: CatalogRef | null;
    readonly name: string;
    readonly description: string;
    readonly tags: readonly string[];
    readonly defaultValue: Decimal;
    readonly minimumValue: Decimal;
    readonly maximumValue: Decimal | null;
    readonly cost: AttributeCost;
    readonly settings: Readonly<Record<string, JsonValue>>;
    readonly value: Decimal | null;
}
//# sourceMappingURL=attribute.d.ts.map