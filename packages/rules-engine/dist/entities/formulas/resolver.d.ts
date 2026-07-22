import type { Character } from "../character/character.js";
import type { Decimal } from "../common.js";
import type { FormulaResolver } from "../values/computed-value.js";
import type { Formula, FormulaContext } from "./formula.js";
/** Resolves formula expressions against one character's attributes and skills. */
export declare class CharacterFormulaResolver implements FormulaResolver {
    #private;
    constructor(character: Character);
    resolve(formula: Formula, context?: FormulaContext): Decimal;
    private resolveReference;
}
//# sourceMappingURL=resolver.d.ts.map