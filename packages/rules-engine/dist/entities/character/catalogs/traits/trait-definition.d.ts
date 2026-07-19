import type { Decimal, JsonSchema } from "../../../common.js";
import type { CatalogDefinition } from "../catalog-definition.js";
/** Category of a definition published by the character catalog. */
export type CatalogCategory = "advantage" | "disadvantage" | "perk" | "quirk" | "skill" | "template" | "racialTrait" | "language";
export type AcquisitionMode = "level" | "points";
export interface AcquisitionRule {
    readonly mode: AcquisitionMode;
    readonly minimum: Decimal;
    readonly maximum: Decimal | null;
    readonly increment: Decimal;
}
export type Prerequisite = {
    readonly kind: "all";
    readonly prerequisites: readonly Prerequisite[];
} | {
    readonly kind: "any";
    readonly prerequisites: readonly Prerequisite[];
} | {
    readonly kind: "not";
    readonly prerequisite: Prerequisite;
} | {
    readonly kind: "attribute";
    readonly attribute: "ST" | "DX" | "IQ" | "HT" | "Will" | "Per";
    readonly minimum: Decimal;
} | {
    readonly kind: "trait";
    readonly definitionId: string;
    readonly minimumLevel?: Decimal;
} | {
    readonly kind: "tag";
    readonly tag: string;
};
export interface TraitDefinition extends CatalogDefinition {
    readonly kind: "trait";
    readonly category: CatalogCategory;
    readonly acquisition: readonly AcquisitionRule[];
    readonly selectionsSchema: JsonSchema;
    readonly prerequisites: readonly Prerequisite[];
    readonly modifierIds: readonly string[];
}
//# sourceMappingURL=trait-definition.d.ts.map