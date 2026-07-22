import type { CatalogKey, Decimal, Computable, JsonSchema, JsonValue, TechnicalName } from "../../common.js";
import type { Formula } from "../../formulas/formula.js";
import type { Prerequisite } from "../traits/prerequisite.js";
import type { ComputedValue } from "../../values/computed-value.js";

export interface Skill extends Computable {
  readonly catalogKey: CatalogKey;
  readonly type: "skill";
  readonly category: "skill";
  readonly name: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly selectionsSchema: JsonSchema;
  readonly selections: Readonly<Record<string, JsonValue>>;
  readonly prerequisites: readonly Prerequisite[];
  readonly notes: string;
  readonly difficulty: Decimal;
  readonly defaults: readonly Formula[];
  readonly experience: Decimal;
  readonly trainingModifier: ComputedValue;
  readonly value: ComputedValue;
}

export function createAttributeSkillDefault(
  attributeTechnicalName: TechnicalName,
  skillTechnicalName: TechnicalName,
): Formula {
  return `attr.${attributeTechnicalName} + difficulty + skill.${skillTechnicalName}.trainingModifier`;
}
