import type { Character } from "../character/character.js";
import type { Attribute } from "../character/attributes/attribute.js";
import type { Skill } from "../character/skills/skill.js";
import type { Decimal, Entity, TechnicalName } from "../common.js";
import {
  addDecimals,
  divideDecimals,
  multiplyDecimals,
  normalizeDecimal,
  powerDecimals,
  subtractDecimals,
} from "../decimal.js";
import type { FormulaResolver } from "../values/computed-value.js";
import { compileFormula } from "./compiler.js";
import type { FormulaCompiled, FormulaCompiledTarget } from "./formula-compiled.js";
import type { Formula, FormulaContext } from "./formula.js";

/** Resolves formula expressions against one character's attributes and skills. */
export class CharacterFormulaResolver implements FormulaResolver {
  readonly #attributes: ReadonlyMap<TechnicalName, Attribute>;
  readonly #skills: ReadonlyMap<TechnicalName, Skill>;

  public constructor(character: Character) {
    this.#attributes = indexByTechnicalName([
      ...character.attributes.primary,
      ...character.attributes.secondaryAdjustments,
    ], "attribute");
    this.#skills = indexByTechnicalName(character.skills, "skill");
  }

  public resolve(formula: Formula, context: FormulaContext = {}): Decimal {
    const compilation = compileFormula(formula);
    if (!compilation.ok) {
      throw new Error(`${compilation.error.message} Position: ${compilation.error.position}.`);
    }
    return this.resolveCompiled(compilation.value, context);
  }

  private resolveCompiled(formula: FormulaCompiled, context: FormulaContext): Decimal {
    switch (formula.kind) {
      case "constant": return normalizeDecimal(formula.value);
      case "reference": return this.resolveReference(formula.target, context);
      case "add": return formula.operands.reduce<Decimal>(
        (value, operand) => addDecimals(value, this.resolveCompiled(operand, context)),
        "0",
      );
      case "multiply": return formula.operands.reduce<Decimal>(
        (value, operand) => multiplyDecimals(value, this.resolveCompiled(operand, context)),
        "1",
      );
      case "subtract": return subtractDecimals(
        this.resolveCompiled(formula.left, context),
        this.resolveCompiled(formula.right, context),
      );
      case "divide": return divideDecimals(
        this.resolveCompiled(formula.left, context),
        this.resolveCompiled(formula.right, context),
      );
      case "power": return powerDecimals(
        this.resolveCompiled(formula.left, context),
        this.resolveCompiled(formula.right, context),
      );
      case "negate": return subtractDecimals("0", this.resolveCompiled(formula.operand, context));
    }
  }

  private resolveReference(target: FormulaCompiledTarget, context: FormulaContext): Decimal {
    switch (target.kind) {
      case "attribute": {
        const attribute = this.#attributes.get(target.technicalName);
        if (attribute === undefined) throw new Error(`Attribute ${target.technicalName} was not found.`);
        return attribute.value.value;
      }
      case "skill": {
        const skill = this.#skills.get(target.technicalName);
        if (skill === undefined) throw new Error(`Skill ${target.technicalName} was not found.`);
        switch (target.value) {
          case "effective": return skill.value.value;
          case "trainingModifier": return skill.trainingModifier.value;
          case "experience": return skill.experience;
        }
      }
      case "variable": {
        const value = context[target.name];
        if (value === undefined) throw new Error(`Formula variable ${target.name} was not provided.`);
        return normalizeDecimal(value);
      }
    }
  }
}

function indexByTechnicalName<T extends Entity>(
  entities: readonly T[],
  entityKind: string,
): ReadonlyMap<TechnicalName, T> {
  const index = new Map<TechnicalName, T>();
  for (const entity of entities) {
    if (index.has(entity.technicalName)) {
      throw new Error(`Duplicate ${entityKind} technicalName: ${entity.technicalName}.`);
    }
    index.set(entity.technicalName, entity);
  }
  return index;
}
