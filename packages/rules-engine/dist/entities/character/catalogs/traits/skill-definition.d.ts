import type { Decimal } from "../../../common.js";
import type { TraitDefinition } from "./trait-definition.js";
export type SkillDefault = {
    readonly kind: "attribute";
    readonly attribute: "DX" | "IQ" | "HT" | "Will" | "Per";
    readonly value: Decimal;
} | {
    readonly kind: "skill";
    readonly definitionId: string;
    readonly value: Decimal;
};
export interface SkillDefinition extends TraitDefinition {
    readonly category: "skill";
    readonly governingAttribute: "DX" | "IQ" | "HT" | "Will" | "Per";
    readonly difficulty: "easy" | "average" | "hard" | "veryHard";
    readonly defaults: readonly SkillDefault[];
}
//# sourceMappingURL=skill-definition.d.ts.map