import { Entity, type CatalogKey, type Computable, type Decimal, type EntityId, type TechnicalName } from "../../common.js";
import type { Formula } from "../../formulas/formula.js";
import { ComputedValue } from "../../values/computed-value.js";
import type { AttributeImprovementRule } from "./attribute-improvement-rule.js";

export interface AttributeInput {
  readonly id: EntityId;
  readonly technicalName: TechnicalName;
  readonly catalogKey: CatalogKey;
  readonly name: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly minValue: Decimal;
  readonly maximumValue: Decimal | null;
  readonly calculation: Formula | null;
  readonly positiveImprovement: AttributeImprovementRule;
  readonly negativeImprovement: AttributeImprovementRule;
  readonly value: ComputedValue;
}

/** One configurable attribute shared by character presets and characters. */
export class Attribute extends Entity implements Computable {
  readonly type: "attribute" = "attribute";
  readonly catalogKey: CatalogKey;
  readonly name: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly maximumValue: Decimal | null;
  readonly positiveImprovement: AttributeImprovementRule;
  readonly negativeImprovement: AttributeImprovementRule;
  #minValue: Decimal;
  #calculation: Formula | null;
  #value: ComputedValue;

  public constructor(input: AttributeInput) {
    super(input.id, input.technicalName);
    this.catalogKey = input.catalogKey;
    this.name = input.name;
    this.description = input.description;
    this.tags = [...input.tags];
    this.maximumValue = input.maximumValue;
    this.positiveImprovement = input.positiveImprovement;
    this.negativeImprovement = input.negativeImprovement;
    this.#value = input.value;
    this.#minValue = assertNonNegativeDecimal(input.minValue);
    this.#calculation = input.calculation;
    if (input.calculation !== null) this.#value.rebase(input.calculation);
  }

  public get kind(): "primary" | "secondary" {
    return this.#calculation === null ? "primary" : "secondary";
  }

  public get minValue(): Decimal { return this.#minValue; }
  public set minValue(value: Decimal) { this.#minValue = assertNonNegativeDecimal(value); }

  public get calculation(): Formula | null { return this.#calculation; }
  public set calculation(value: Formula | null) {
    this.#calculation = value;
    if (value !== null) this.#value.rebase(value);
  }

  public get value(): ComputedValue { return this.#value; }
  public set value(value: ComputedValue) {
    this.#value = value;
    if (this.#calculation !== null) this.#value.rebase(this.#calculation);
  }
}

function assertNonNegativeDecimal(value: Decimal): Decimal {
  if (!/^-?(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(value)) {
    throw new TypeError(`Invalid decimal value: ${value}`);
  }
  if (value.startsWith("-")) throw new RangeError("An attribute minimum value cannot be negative.");
  return value;
}
