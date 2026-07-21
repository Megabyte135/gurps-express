import type { CatalogKey, Decimal, Computable, EntityId, JsonSchema, JsonValue } from "../../common.js";
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

export function createAttributeSkillDefault(attributeId: EntityId): Formula {
  return {
    kind: "add",
    operands: [
      { kind: "reference", target: { kind: "attribute", attributeId, value: "effective" } },
      { kind: "reference", target: { kind: "variable", name: "difficulty" } },
      { kind: "reference", target: { kind: "variable", name: "trainingModifier" } },
    ],
  };
}

export function createHighestSkillDefault(defaults: readonly Formula[]): Formula {
  if (defaults.length === 0) {
    throw new Error("A skill requires at least one default formula.");
  }
  if (defaults.length === 1) {
    return defaults[0];
  }
  return { kind: "maximum", operands: defaults };
}
