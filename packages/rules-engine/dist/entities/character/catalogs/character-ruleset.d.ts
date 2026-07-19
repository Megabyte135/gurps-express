import type { Decimal, JsonValue } from "../../common.js";
import type { CatalogDefinition } from "./catalog-definition.js";
export interface AttributeCostRule {
    readonly pointsPerIncrement: Decimal;
    readonly increment: Decimal;
}
/** Configurable definition of one character attribute. */
export interface CharacterAttributeDefinition extends CatalogDefinition {
    readonly defaultValue: Decimal;
    readonly minimumValue: Decimal;
    readonly maximumValue: Decimal | null;
    readonly cost: AttributeCostRule;
    readonly settings: Readonly<Record<string, JsonValue>>;
}
/**
 * A customisable set of character defaults. The catalog selects one default
 * ruleset, while an individual character may reference any catalogued one.
 */
export interface CharacterRuleset extends CatalogDefinition {
    readonly primaryAttributes: readonly CharacterAttributeDefinition[];
    readonly secondaryAttributes: readonly CharacterAttributeDefinition[];
}
//# sourceMappingURL=character-ruleset.d.ts.map