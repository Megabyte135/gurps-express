import type { Decimal } from "../../../common.js";
import type { Trait } from "../trait.js";
export type SkillDefault = {
    readonly kind: "attribute";
    readonly attribute: string;
    readonly value: Decimal;
} | {
    readonly kind: "skill";
    readonly traitId: string;
    readonly value: Decimal;
};
export interface Skill extends Trait {
    readonly category: "skill";
    readonly governingAttribute: string;
    readonly difficulty: "easy" | "average" | "hard" | "veryHard";
    readonly defaults: readonly SkillDefault[];
}
//# sourceMappingURL=skill.d.ts.map