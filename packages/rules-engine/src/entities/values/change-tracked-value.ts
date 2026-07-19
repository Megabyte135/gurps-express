import type { Decimal, EntityId } from "../common.js";
import type { ChangeOperand, ValueChange, ValueChangeInput } from "./value-change.js";

export interface ChangeTrackedValueSnapshot {
  readonly baseValue: Decimal;
  readonly changesList: readonly ValueChange[];
}

const DECIMAL_PATTERN = /^-?(0|[1-9][0-9]*)(\.[0-9]+)?$/;
const DIVISION_SCALE = 12;

interface DecimalParts {
  readonly unscaled: bigint;
  readonly scale: number;
}

/**
 * A parameter value with an append-only, reversible history. `value` cannot be
 * assigned directly: every mutation creates a ValueChange and is replayed from
 * baseValue when a change is removed.
 */
export class ChangeTrackedValue {
  #baseValue: Decimal;
  readonly #changesList: ValueChange[];
  #value: Decimal;

  public constructor(snapshot: ChangeTrackedValueSnapshot) {
    this.#baseValue = normalizeDecimal(snapshot.baseValue);
    this.#changesList = [...snapshot.changesList].map(normalizeChange);
    assertUniqueChangeIds(this.#changesList);
    assertContiguousSequence(this.#changesList);
    this.#value = replay(this.#baseValue, this.#changesList);
  }

  public get baseValue(): Decimal { return this.#baseValue; }
  public get value(): Decimal { return this.#value; }
  public get changesList(): readonly ValueChange[] { return this.#changesList.map(cloneChange); }

  public change(input: ValueChangeInput): ValueChange {
    if (this.#changesList.some((change) => change.id === input.id)) {
      throw new Error(`A change with id ${input.id} already exists.`);
    }
    const change = normalizeChange({ ...input, sequence: this.#changesList.length + 1 });
    this.#changesList.push(change);
    this.#value = replay(this.#baseValue, this.#changesList);
    return cloneChange(change);
  }

  public revertChange(changeId: EntityId): boolean {
    const index = this.#changesList.findIndex((change) => change.id === changeId);
    if (index === -1) return false;
    this.#changesList.splice(index, 1);
    this.#changesList.forEach((change, position) => {
      this.#changesList[position] = { ...change, sequence: position + 1 };
    });
    this.#value = replay(this.#baseValue, this.#changesList);
    return true;
  }

  /** Replaces a formula-derived baseline while preserving all explicit changes. */
  public rebase(baseValue: Decimal): void {
    this.#baseValue = normalizeDecimal(baseValue);
    this.#value = replay(this.#baseValue, this.#changesList);
  }

  public toSnapshot(): ChangeTrackedValueSnapshot {
    return { baseValue: this.#baseValue, changesList: this.changesList };
  }
}

function normalizeChange(change: ValueChange): ValueChange {
  if (!Number.isSafeInteger(change.sequence) || change.sequence < 1) {
    throw new RangeError("A change sequence must be a positive safe integer.");
  }
  if (change.reason.trim().length === 0 || change.source.description.trim().length === 0) {
    throw new Error("A change reason and source description are required.");
  }
  return {
    ...change,
    source: { ...change.source },
    magnitude: normalizeDecimal(change.magnitude),
  };
}

function cloneChange(change: ValueChange): ValueChange {
  return { ...change, source: { ...change.source } };
}

function assertUniqueChangeIds(changes: readonly ValueChange[]): void {
  if (new Set(changes.map((change) => change.id)).size !== changes.length) {
    throw new Error("Change identifiers must be unique.");
  }
}

function assertContiguousSequence(changes: readonly ValueChange[]): void {
  const ordered = [...changes].sort((left, right) => left.sequence - right.sequence);
  if (ordered.some((change, index) => change.sequence !== index + 1)) {
    throw new Error("Change sequences must start at 1 and be contiguous.");
  }
}

function replay(baseValue: Decimal, changes: readonly ValueChange[]): Decimal {
  return [...changes].sort((left, right) => left.sequence - right.sequence)
    .reduce<Decimal>((value, change) => applyChange(value, change), baseValue);
}

function applyChange(value: Decimal, change: ValueChange): Decimal {
  switch (change.operand) {
    case "add": return add(value, change.magnitude);
    case "multiply": return multiply(value, change.magnitude);
    case "divide": return divide(value, change.magnitude);
  }
}

function normalizeDecimal(value: Decimal): Decimal {
  if (!DECIMAL_PATTERN.test(value)) throw new TypeError(`Invalid decimal value: ${value}`);
  return format(parseDecimal(value));
}

function parseDecimal(value: Decimal): DecimalParts {
  const negative = value.startsWith("-");
  const unsigned = negative ? value.slice(1) : value;
  const [whole, fraction = ""] = unsigned.split(".");
  const unscaled = BigInt(`${whole}${fraction}`) * (negative ? -1n : 1n);
  return { unscaled, scale: fraction.length };
}

function format(parts: DecimalParts): Decimal {
  const normalized = normalize(parts);
  if (normalized.unscaled === 0n) return "0";
  const signPrefix = normalized.unscaled < 0n ? "-" : "";
  const digits = abs(normalized.unscaled).toString();
  if (normalized.scale === 0) return `${signPrefix}${digits}`;
  const padded = digits.padStart(normalized.scale + 1, "0");
  return `${signPrefix}${padded.slice(0, -normalized.scale)}.${padded.slice(-normalized.scale)}`;
}

function normalize(parts: DecimalParts): DecimalParts {
  let { unscaled, scale } = parts;
  while (scale > 0 && unscaled % 10n === 0n) { unscaled /= 10n; scale -= 1; }
  return { unscaled, scale };
}

function add(left: Decimal, right: Decimal): Decimal {
  const a = parseDecimal(left); const b = parseDecimal(right);
  const scale = Math.max(a.scale, b.scale);
  return format({
    unscaled: a.unscaled * 10n ** BigInt(scale - a.scale) + b.unscaled * 10n ** BigInt(scale - b.scale),
    scale,
  });
}

function multiply(left: Decimal, right: Decimal): Decimal {
  const a = parseDecimal(left); const b = parseDecimal(right);
  return format({ unscaled: a.unscaled * b.unscaled, scale: a.scale + b.scale });
}

function divide(left: Decimal, right: Decimal): Decimal {
  const a = parseDecimal(left); const b = parseDecimal(right);
  if (b.unscaled === 0n) throw new RangeError("A value change cannot divide by zero.");
  const numerator = a.unscaled * 10n ** BigInt(DIVISION_SCALE + b.scale);
  const denominator = b.unscaled * 10n ** BigInt(a.scale);
  const quotient = numerator / denominator;
  const remainder = numerator % denominator;
  const rounded = abs(remainder) * 2n >= abs(denominator) ? quotient + sign(numerator) * sign(denominator) : quotient;
  return format({ unscaled: rounded, scale: DIVISION_SCALE });
}

function abs(value: bigint): bigint { return value < 0n ? -value : value; }
function sign(value: bigint): bigint { return value < 0n ? -1n : 1n; }
