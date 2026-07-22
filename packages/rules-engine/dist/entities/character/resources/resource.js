import { Entity } from "../../common.js";
import { absoluteDecimal, addDecimals, compareDecimals, multiplyDecimals, normalizeDecimal, subtractDecimals, } from "../../decimal.js";
/** A resource with validated current value and threshold list. */
export class Resource extends Entity {
    type = "resource";
    catalogKey;
    name;
    description;
    minimumFormula;
    maximumValue;
    thresholds;
    #minimumValue;
    #value;
    constructor(input, minimumValue, value, thresholds) {
        super(input.id, input.technicalName);
        this.catalogKey = input.catalogKey;
        this.name = input.name;
        this.description = input.description;
        this.minimumFormula = input.minimumFormula;
        this.maximumValue = input.maximumValue;
        this.#minimumValue = minimumValue;
        this.#value = value;
        this.thresholds = [...thresholds];
    }
    static create(input, formulaResolver) {
        const minimumValue = evaluateDecimalFormula(input.minimumFormula, formulaResolver);
        if (!minimumValue.ok)
            return minimumValue;
        return Resource.build(input, minimumValue.value, input.maximumValue.value);
    }
    static createWithGeneratedThresholds(input, thresholdStepFormula, formulaResolver) {
        const minimumValue = evaluateDecimalFormula(input.minimumFormula, formulaResolver);
        if (!minimumValue.ok)
            return minimumValue;
        const generatedThresholds = generateThresholdsFromStep(thresholdStepFormula, minimumValue.value, input.maximumValue.value, formulaResolver);
        if (!generatedThresholds.ok)
            return generatedThresholds;
        return Resource.build({
            ...input,
            thresholds: generatedThresholds.value,
        }, minimumValue.value, input.maximumValue.value);
    }
    get value() {
        return this.#value;
    }
    set value(next) {
        const normalized = validateResourceDecimal(next);
        if (!normalized.ok)
            throw new TypeError(normalized.error.message);
        const validated = validateResourceValue(normalized.value, this.#minimumValue, this.maximumValue.value);
        if (!validated.ok)
            throw new RangeError(validated.error.message);
        this.#value = validated.value;
    }
    get minimumValue() {
        return this.#minimumValue;
    }
    static build(input, minimumValue, maximumValue) {
        const rangeCheck = validateRange(minimumValue, maximumValue);
        if (!rangeCheck.ok)
            return rangeCheck;
        const validatedThresholds = validateAndNormalizeThresholds(input.thresholds, minimumValue, maximumValue);
        if (!validatedThresholds.ok)
            return validatedThresholds;
        const value = validateResourceDecimal(input.value);
        if (!value.ok)
            return value;
        const normalizedValue = value.value;
        const valueValidation = validateResourceValue(normalizedValue, minimumValue, maximumValue);
        if (!valueValidation.ok)
            return valueValidation;
        return {
            ok: true,
            value: new Resource(input, minimumValue, normalizedValue, validatedThresholds.value),
        };
    }
}
function generateThresholdsFromStep(stepFormula, minimumValue, maximumValue, formulaResolver) {
    const step = evaluateDecimalFormula(stepFormula, formulaResolver);
    if (!step.ok)
        return step;
    const range = subtractDecimals(maximumValue, minimumValue);
    const normalizedRangeIsPositive = compareDecimals(range, "0") > 0;
    const normalizedRangeIsNegative = compareDecimals(range, "0") < 0;
    if (!normalizedRangeIsPositive && !normalizedRangeIsNegative) {
        return { ok: true, value: [maximumValue] };
    }
    const direction = compareDecimals(step.value, "0");
    if (direction === 0) {
        return {
            ok: false,
            error: {
                code: "invalid-resource-threshold",
                message: "Threshold generation step cannot be zero.",
                invalidValues: [step.value],
            },
        };
    }
    const stepSize = multiplyDecimals(absoluteDecimal(step.value), absoluteDecimal(range));
    if (compareDecimals(stepSize, "0") === 0) {
        return {
            ok: false,
            error: {
                code: "invalid-resource-threshold",
                message: "Threshold generation step resolves to zero after applying resource range.",
                invalidValues: [step.value],
            },
        };
    }
    const generateDownward = direction < 0 && normalizedRangeIsPositive || direction > 0 && normalizedRangeIsNegative;
    const end = generateDownward ? maximumValue : minimumValue;
    const start = generateDownward ? minimumValue : maximumValue;
    const result = [];
    let current = start;
    while (true) {
        result.push(current);
        const next = generateDownward ? subtractDecimals(current, stepSize) : addDecimals(current, stepSize);
        if (compareDecimals(next, end) === 0) {
            result.push(next);
            break;
        }
        const reachedBoundary = generateDownward ? compareDecimals(next, end) < 0 : compareDecimals(next, end) > 0;
        if (reachedBoundary) {
            result.push(end);
            break;
        }
        current = next;
    }
    return { ok: true, value: result };
}
function validateAndNormalizeThresholds(thresholds, minimumValue, maximumValue) {
    const valid = [];
    const invalidValues = [];
    for (const threshold of thresholds) {
        const normalized = validateResourceDecimal(threshold);
        if (!normalized.ok) {
            invalidValues.push(threshold);
            continue;
        }
        if (!isInRange(normalized.value, minimumValue, maximumValue)) {
            invalidValues.push(threshold);
            continue;
        }
        valid.push(normalized.value);
    }
    if (invalidValues.length > 0) {
        return {
            ok: false,
            error: {
                code: "invalid-resource-threshold",
                message: "Resource thresholds must be decimal values between minimum and maximum values.",
                invalidValues,
            },
        };
    }
    return { ok: true, value: valid };
}
function validateRange(minimumValue, maximumValue) {
    if (compareDecimals(minimumValue, maximumValue) > 0) {
        return {
            ok: false,
            error: {
                code: "invalid-resource-range",
                message: `Resource minimum value (${minimumValue}) cannot exceed maximum value (${maximumValue}).`,
                minimumValue,
                maximumValue,
            },
        };
    }
    return { ok: true, value: undefined };
}
function validateResourceValue(value, minimumValue, maximumValue) {
    if (!isInRange(value, minimumValue, maximumValue)) {
        return {
            ok: false,
            error: {
                code: "invalid-resource-value",
                message: `Resource value ${value} must be between minimum ${minimumValue} and maximum ${maximumValue}.`,
                invalidValues: [value],
            },
        };
    }
    return { ok: true, value };
}
function evaluateDecimalFormula(formula, formulaResolver) {
    const resolved = formulaResolver.resolve(formula);
    const value = validateResourceDecimal(resolved);
    if (!value.ok) {
        return {
            ok: false,
            error: {
                code: "invalid-resource-formula",
                message: `Resource formula must resolve to a decimal; received ${resolved}.`,
                formula,
            },
        };
    }
    return value;
}
function isInRange(value, minimumValue, maximumValue) {
    return compareDecimals(value, minimumValue) >= 0 && compareDecimals(value, maximumValue) <= 0;
}
function validateResourceDecimal(value) {
    try {
        return { ok: true, value: normalizeDecimal(value) };
    }
    catch {
        return {
            ok: false,
            error: {
                code: "invalid-resource-value",
                message: `Expected a decimal value, received ${value}.`,
                invalidValues: [value],
            },
        };
    }
}
//# sourceMappingURL=resource.js.map