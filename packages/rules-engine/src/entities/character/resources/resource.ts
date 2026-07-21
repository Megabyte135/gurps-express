import type { CatalogKey, Computable, Decimal, EntityId, Result } from "../../common.js";
import type { Formula } from "../../formulas/formula.js";
import type { ComputedValue, FormulaResolver } from "../../values/computed-value.js";

const DECIMAL_PATTERN = /^-?(0|[1-9][0-9]*)(\.[0-9]+)?$/;

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

export type ResourceError =
  | InvalidResourceValueError
  | InvalidResourceFormulaError
  | InvalidResourceRangeError
  | InvalidResourceThresholdError;

export interface ResourceInput {
  readonly id: EntityId;
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
  readonly catalogKey: CatalogKey;
  readonly name: string;
  readonly description: string;
  readonly minimumFormula: Formula;
  readonly maximumValue: ComputedValue;
  readonly value: Decimal;
}

/** A resource with validated current value and threshold list. */
export class Resource implements Computable {
  readonly id: EntityId;
  readonly type: "resource" = "resource";
  readonly catalogKey: CatalogKey;
  readonly name: string;
  readonly description: string;
  readonly minimumFormula: Formula;
  readonly maximumValue: ComputedValue;
  readonly thresholds: readonly Decimal[];
  #minimumValue: Decimal;
  #value: Decimal;

  private constructor(
    input: ResourceInput,
    minimumValue: Decimal,
    value: Decimal,
    thresholds: readonly Decimal[],
  ) {
    this.id = input.id;
    this.catalogKey = input.catalogKey;
    this.name = input.name;
    this.description = input.description;
    this.minimumFormula = input.minimumFormula;
    this.maximumValue = input.maximumValue;
    this.#minimumValue = minimumValue;
    this.#value = value;
    this.thresholds = [...thresholds];
  }

  public static create(input: ResourceInput, formulaResolver: FormulaResolver): Result<Resource, ResourceError> {
    const minimumValue = evaluateDecimalFormula(input.minimumFormula, formulaResolver);
    if (!minimumValue.ok) return minimumValue;

    return buildResource(input, minimumValue.value, input.maximumValue.value);
  }

  public static createWithGeneratedThresholds(
    input: ResourceInputWithoutThresholds,
    thresholdStepFormula: Formula,
    formulaResolver: FormulaResolver,
  ): Result<Resource, ResourceError> {
    const minimumValue = evaluateDecimalFormula(input.minimumFormula, formulaResolver);
    if (!minimumValue.ok) return minimumValue;

    const generatedThresholds = generateThresholdsFromStep(
      thresholdStepFormula,
      minimumValue.value,
      input.maximumValue.value,
      formulaResolver,
    );
    if (!generatedThresholds.ok) return generatedThresholds;

    return buildResource(
      {
        ...input,
        thresholds: generatedThresholds.value,
      },
      minimumValue.value,
      input.maximumValue.value,
    );
  }

  public get value(): Decimal {
    return this.#value;
  }

  public set value(next: Decimal) {
    const normalized = normalizeDecimal(next);
    if (!normalized.ok) throw new TypeError(normalized.error.message);
    const validated = validateResourceValue(normalized.value, this.#minimumValue, this.maximumValue.value);
    if (!validated.ok) throw new RangeError(validated.error.message);
    this.#value = validated.value;
  }

  public get minimumValue(): Decimal {
    return this.#minimumValue;
  }
}

function buildResource(
  input: ResourceInput,
  minimumValue: Decimal,
  maximumValue: Decimal,
): Result<Resource, ResourceError> {
  const rangeCheck = validateRange(minimumValue, maximumValue);
  if (!rangeCheck.ok) return rangeCheck;

  const validatedThresholds = validateAndNormalizeThresholds(input.thresholds, minimumValue, maximumValue);
  if (!validatedThresholds.ok) return validatedThresholds;

  const value = normalizeDecimal(input.value);
  if (!value.ok) return value;

  const normalizedValue = value.value;
  const valueValidation = validateResourceValue(normalizedValue, minimumValue, maximumValue);
  if (!valueValidation.ok) return valueValidation;

  return {
    ok: true,
    value: new Resource(input, minimumValue, normalizedValue, validatedThresholds.value),
  };
}

function generateThresholdsFromStep(
  stepFormula: Formula,
  minimumValue: Decimal,
  maximumValue: Decimal,
  formulaResolver: FormulaResolver,
): Result<readonly Decimal[], ResourceError> {
  const step = evaluateDecimalFormula(stepFormula, formulaResolver);
  if (!step.ok) return step;

  const range = subtractDecimal(maximumValue, minimumValue);
  const normalizedRange = formatDecimal(range);
  const normalizedRangeIsPositive = compare(normalizedRange, "0") > 0;
  const normalizedRangeIsNegative = compare(normalizedRange, "0") < 0;
  if (!normalizedRangeIsPositive && !normalizedRangeIsNegative) {
    return { ok: true, value: [maximumValue] };
  }

  const direction = compare(step.value, "0");
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

  const stepSize = multiplyDecimal(absDecimal(step.value), formatDecimal(absDecimal(range)));
  if (compare(stepSize, "0") === 0) {
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
  const result: Decimal[] = [];
  let current = start;

  while (true) {
    result.push(current);

    const next = generateDownward ? subtractDecimal(current, stepSize) : addDecimal(current, stepSize);
    if (compare(next, end) === 0) {
      result.push(next);
      break;
    }

    const reachedBoundary = generateDownward ? compare(next, end) < 0 : compare(next, end) > 0;
    if (reachedBoundary) {
      result.push(end);
      break;
    }

    current = next;
  }

  return { ok: true, value: result };
}

function validateAndNormalizeThresholds(
  thresholds: readonly Decimal[],
  minimumValue: Decimal,
  maximumValue: Decimal,
): Result<readonly Decimal[], InvalidResourceThresholdError> {
  const valid: Decimal[] = [];
  const invalidValues: unknown[] = [];

  for (const threshold of thresholds) {
    const normalized = normalizeDecimal(threshold);
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

function validateRange(minimumValue: Decimal, maximumValue: Decimal): Result<void, InvalidResourceRangeError> {
  if (compare(minimumValue, maximumValue) > 0) {
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

function validateResourceValue(
  value: Decimal,
  minimumValue: Decimal,
  maximumValue: Decimal,
): Result<Decimal, InvalidResourceValueError> {
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

function evaluateDecimalFormula(
  formula: Formula,
  formulaResolver: FormulaResolver,
): Result<Decimal, InvalidResourceFormulaError> {
  const resolved = formulaResolver.resolve(formula);
  const value = normalizeDecimal(resolved);
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

function isInRange(value: Decimal, minimumValue: Decimal, maximumValue: Decimal): boolean {
  return compare(value, minimumValue) >= 0 && compare(value, maximumValue) <= 0;
}

function normalizeDecimal(value: Decimal): Result<Decimal, InvalidResourceValueError | InvalidResourceFormulaError> {
  if (!isDecimal(value)) {
    return {
      ok: false,
      error: {
        code: "invalid-resource-value",
        message: `Expected a decimal value, received ${value}.`,
        invalidValues: [value],
      },
    };
  }
  return { ok: true, value: formatDecimal(parseDecimal(value)) };
}

interface DecimalParts {
  readonly unscaled: bigint;
  readonly scale: number;
}

function absDecimal(value: Decimal): Decimal {
  return value.startsWith("-") ? value.slice(1) : value;
}

function isDecimal(value: Decimal): boolean {
  return DECIMAL_PATTERN.test(value);
}

function parseDecimal(value: Decimal): DecimalParts {
  const negative = value.startsWith("-");
  const unsigned = negative ? value.slice(1) : value;
  const [whole, fraction = ""] = unsigned.split(".");
  const unscaled = BigInt(`${whole}${fraction}`) * (negative ? -1n : 1n);
  return { unscaled, scale: fraction.length };
}

function formatDecimal(parts: DecimalParts): Decimal {
  let { unscaled, scale } = normalizeParts(parts);
  if (unscaled === 0n) return "0";
  const signPrefix = unscaled < 0n ? "-" : "";
  const digits = (unscaled < 0n ? -unscaled : unscaled).toString();
  if (scale === 0) return `${signPrefix}${digits}`;
  const padded = digits.padStart(scale + 1, "0");
  return `${signPrefix}${padded.slice(0, -scale)}.${padded.slice(-scale)}`;
}

function normalizeParts(parts: DecimalParts): DecimalParts {
  let { unscaled, scale } = parts;
  while (scale > 0 && unscaled % 10n === 0n) {
    unscaled /= 10n;
    scale -= 1;
  }
  return { unscaled, scale };
}

function compare(left: Decimal, right: Decimal): number {
  const leftParts = normalizeParts(parseDecimal(left));
  const rightParts = normalizeParts(parseDecimal(right));
  const scale = Math.max(leftParts.scale, rightParts.scale);
  const alignedLeft = leftParts.unscaled * 10n ** BigInt(scale - leftParts.scale);
  const alignedRight = rightParts.unscaled * 10n ** BigInt(scale - rightParts.scale);
  if (alignedLeft < alignedRight) return -1;
  if (alignedLeft > alignedRight) return 1;
  return 0;
}

function alignScale(left: Decimal, right: Decimal): [bigint, bigint, number] {
  const leftParsed = parseDecimal(left);
  const rightParsed = parseDecimal(right);
  const scale = Math.max(leftParsed.scale, rightParsed.scale);
  const leftAligned = leftParsed.unscaled * 10n ** BigInt(scale - leftParsed.scale);
  const rightAligned = rightParsed.unscaled * 10n ** BigInt(scale - rightParsed.scale);
  return [leftAligned, rightAligned, scale];
}

function addDecimal(left: Decimal, right: Decimal): Decimal {
  const [leftAligned, rightAligned, scale] = alignScale(left, right);
  return formatDecimal({ unscaled: leftAligned + rightAligned, scale });
}

function subtractDecimal(left: Decimal, right: Decimal): Decimal {
  const [leftAligned, rightAligned, scale] = alignScale(left, right);
  return formatDecimal({ unscaled: leftAligned - rightAligned, scale });
}

function multiplyDecimal(left: Decimal, right: Decimal): Decimal {
  const leftParts = parseDecimal(left);
  const rightParts = parseDecimal(right);
  return formatDecimal({ unscaled: leftParts.unscaled * rightParts.unscaled, scale: leftParts.scale + rightParts.scale });
}
