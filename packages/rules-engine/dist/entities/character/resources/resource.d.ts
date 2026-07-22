import { Entity, type CatalogKey, type Computable, type Decimal, type EntityId, type Result, type TechnicalName } from "../../common.js";
import type { Formula } from "../../formulas/formula.js";
import type { ComputedValue, FormulaResolver } from "../../values/computed-value.js";
interface InvalidResourceValueError {
    readonly code: "invalid-resource-value";
    readonly message: string;
    readonly invalidValues: readonly unknown[];
}
interface InvalidResourceFormulaError {
    readonly code: "invalid-resource-formula";
    readonly message: string;
    readonly formula: Formula;
}
interface InvalidResourceRangeError {
    readonly code: "invalid-resource-range";
    readonly message: string;
    readonly minimumValue: Decimal;
    readonly maximumValue: Decimal;
}
interface InvalidResourceThresholdError {
    readonly code: "invalid-resource-threshold";
    readonly message: string;
    readonly invalidValues: readonly unknown[];
}
export type ResourceError = InvalidResourceValueError | InvalidResourceFormulaError | InvalidResourceRangeError | InvalidResourceThresholdError;
export interface ResourceInput {
    readonly id: EntityId;
    readonly technicalName: TechnicalName;
    readonly catalogKey: CatalogKey;
    readonly name: string;
    readonly description: string;
    readonly minimumFormula: Formula;
    readonly maximumValue: ComputedValue;
    readonly value: Decimal;
    readonly thresholds: readonly Decimal[];
}
interface ResourceInputWithoutThresholds {
    readonly id: EntityId;
    readonly technicalName: TechnicalName;
    readonly catalogKey: CatalogKey;
    readonly name: string;
    readonly description: string;
    readonly minimumFormula: Formula;
    readonly maximumValue: ComputedValue;
    readonly value: Decimal;
}
/** A resource with validated current value and threshold list. */
export declare class Resource extends Entity implements Computable {
    #private;
    readonly type: "resource";
    readonly catalogKey: CatalogKey;
    readonly name: string;
    readonly description: string;
    readonly minimumFormula: Formula;
    readonly maximumValue: ComputedValue;
    readonly thresholds: readonly Decimal[];
    private constructor();
    static create(input: ResourceInput, formulaResolver: FormulaResolver): Result<Resource, ResourceError>;
    static createWithGeneratedThresholds(input: ResourceInputWithoutThresholds, thresholdStepFormula: Formula, formulaResolver: FormulaResolver): Result<Resource, ResourceError>;
    get value(): Decimal;
    set value(next: Decimal);
    get minimumValue(): Decimal;
    private static build;
}
export {};
//# sourceMappingURL=resource.d.ts.map