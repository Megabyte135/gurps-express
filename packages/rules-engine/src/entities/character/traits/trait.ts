import { Entity, type CatalogKey, type Decimal, type EntityId, type TechnicalName } from "../../common.js";
import { normalizeDecimal, multiplyDecimals } from "../../decimal.js";
import type { ComputedValue } from "../../values/computed-value.js";
import type { Modifier } from "./modifiers/modifier.js";
import type { Prerequisite } from "./prerequisite.js";

export interface TraitInput {
  readonly id: EntityId;
  readonly technicalName: TechnicalName;
  readonly catalogKey: CatalogKey;
  readonly name: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly prerequisites: readonly Prerequisite[];
  readonly modifierIds: readonly string[];
  readonly modifiers: readonly Modifier[];
  readonly notes: string;
  readonly level: Decimal;
  readonly pointCost: ComputedValue;
}

export class Trait extends Entity {
  readonly type: "trait" = "trait";
  readonly catalogKey: CatalogKey;
  readonly name: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly prerequisites: readonly Prerequisite[];
  readonly modifierIds: readonly string[];
  readonly notes: string;
  #modifiers: readonly Modifier[];
  #level: Decimal;
  #pointCost: ComputedValue;
  #acquisition: string;
  #constCost: Decimal;
  #perLevelCost: Decimal;
  #customCosts: readonly { readonly level: Decimal; readonly cost: Decimal }[];

  public constructor(input: TraitInput) {
    super(input.id, input.technicalName);
    this.catalogKey = input.catalogKey;
    this.name = input.name;
    this.description = input.description;
    this.tags = [...input.tags];
    this.prerequisites = [...input.prerequisites];
    this.modifierIds = [...input.modifierIds];
    this.#modifiers = [...input.modifiers];
    this.notes = input.notes;
    this.#level = normalizeDecimal(input.level);
    this.#pointCost = input.pointCost;
    this.#acquisition = "const";
    this.#constCost = "0";
    this.#perLevelCost = "0";
    this.#customCosts = [];
  }

  public get level(): Decimal { return this.#level; }
  public set level(value: Decimal) {
    this.#level = normalizeDecimal(value);
    this.#recomputePointCost();
  }

  public get modifiers(): readonly Modifier[] { return this.#modifiers; }
  public set modifiers(value: readonly Modifier[]) {
    this.#modifiers = [...value];
  }

  public get pointCost(): ComputedValue { return this.#pointCost; }

  public get acquisition(): string { return this.#acquisition; }

  public setConstAcquisition(baseCost: Decimal): void {
    this.#acquisition = "const";
    this.#constCost = normalizeDecimal(baseCost);
    this.#recomputePointCost();
  }

  public setLevelAcquisition(perLevelCost: Decimal): void {
    this.#acquisition = "level";
    this.#perLevelCost = normalizeDecimal(perLevelCost);
    this.#recomputePointCost();
  }

  public setCustomAcquisition(levelCosts: readonly { readonly level: Decimal; readonly cost: Decimal }[]): void {
    this.#acquisition = "custom";
    this.#customCosts = levelCosts.map((lc) => ({
      level: normalizeDecimal(lc.level),
      cost: normalizeDecimal(lc.cost),
    }));
    this.#recomputePointCost();
  }

  #recomputePointCost(): void {
    this.#pointCost.rebase(this.#computeBaseCost());
  }

  #computeBaseCost(): Decimal {
    if (this.#acquisition === "const") {
      return this.#constCost;
    }
    if (this.#acquisition === "level") {
      return multiplyDecimals(this.#perLevelCost, this.#level);
    }
    return this.#findCustomCost();
  }

  #findCustomCost(): Decimal {
    for (const lc of this.#customCosts) {
      if (lc.level === this.#level) return lc.cost;
    }
    return "0";
  }
}
