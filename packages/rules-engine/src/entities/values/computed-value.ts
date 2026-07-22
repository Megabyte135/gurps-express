import type { Decimal, EntityId } from "../common.js";
import { addDecimals, divideDecimals, multiplyDecimals, normalizeDecimal } from "../decimal.js";
import type { Formula, FormulaContext } from "../formulas/formula.js";
import type { ComputedValueMutation, ComputedValueMutationInput } from "./value-mutation.js";

export interface ComputedValueSnapshot {
  readonly baseValue: Formula;
  readonly changesList: readonly ComputedValueMutation[];
  readonly context?: FormulaContext;
}

/** Evaluates a formula in the aggregate that owns this value. */
export interface FormulaResolver {
  resolve(formula: Formula, context?: FormulaContext): Decimal;
}

/**
 * A value that can be changed over time by reversible mutations.
 * Mutations are stored in an append-only history; computed value is always
 * replayed from baseValue so removal is safe and deterministic.
 */
export class ComputedValue {
  #baseValue: Formula;
  readonly #changesList: ComputedValueMutation[];
  readonly #formulaResolver: FormulaResolver;
  #context: FormulaContext;

  public constructor(snapshot: ComputedValueSnapshot, formulaResolver: FormulaResolver) {
    this.#baseValue = snapshot.baseValue;
    this.#formulaResolver = formulaResolver;
    this.#changesList = [...snapshot.changesList].map(normalizeMutation);
    this.#context = { ...snapshot.context };
    assertUniqueChangeIds(this.#changesList);
    assertContiguousSequence(this.#changesList);
  }

  public get baseValue(): Formula { return this.#baseValue; }
  public get value(): Decimal {
    return replay(normalizeDecimal(this.#formulaResolver.resolve(this.#baseValue, this.#context)), this.#changesList);
  }
  public get changesList(): readonly ComputedValueMutation[] { return this.#changesList.map(cloneMutation); }
  public get context(): FormulaContext { return { ...this.#context }; }

  public applyMutation(input: ComputedValueMutationInput): ComputedValueMutation {
    if (this.#changesList.some((change) => change.id === input.id)) {
      throw new Error(`A change with id ${input.id} already exists.`);
    }
    const change = normalizeMutation({ ...input, sequence: this.#changesList.length + 1 });
    this.#changesList.push(change);
    return cloneMutation(change);
  }

  public removeMutation(changeId: EntityId): boolean {
    const index = this.#changesList.findIndex((change) => change.id === changeId);
    if (index === -1) return false;
    this.#changesList.splice(index, 1);
    this.#changesList.forEach((change, position) => {
      this.#changesList[position] = { ...change, sequence: position + 1 };
    });
    return true;
  }

  /** Replaces the baseline formula while preserving all explicit changes. */
  public rebase(baseValue: Formula): void {
    this.#baseValue = baseValue;
  }

  public setContext(context: FormulaContext): void {
    this.#context = { ...context };
  }

  public toSnapshot(): ComputedValueSnapshot {
    return { baseValue: this.#baseValue, changesList: this.changesList, context: this.context };
  }
}

function normalizeMutation(change: ComputedValueMutation): ComputedValueMutation {
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

function cloneMutation(change: ComputedValueMutation): ComputedValueMutation {
  return { ...change, source: { ...change.source } };
}

function assertUniqueChangeIds(changes: readonly ComputedValueMutation[]): void {
  if (new Set(changes.map((change) => change.id)).size !== changes.length) {
    throw new Error("Change identifiers must be unique.");
  }
}

function assertContiguousSequence(changes: readonly ComputedValueMutation[]): void {
  const ordered = [...changes].sort((left, right) => left.sequence - right.sequence);
  if (ordered.some((change, index) => change.sequence !== index + 1)) {
    throw new Error("Change sequences must start at 1 and be contiguous.");
  }
}

function replay(baseValue: Decimal, changes: readonly ComputedValueMutation[]): Decimal {
  return [...changes].sort((left, right) => left.sequence - right.sequence)
    .reduce<Decimal>((value, change) => applyMutation(value, change), baseValue);
}

function applyMutation(value: Decimal, change: ComputedValueMutation): Decimal {
  switch (change.operand) {
    case "add": return addDecimals(value, change.magnitude);
    case "multiply": return multiplyDecimals(value, change.magnitude);
    case "divide": return divideDecimals(value, change.magnitude);
  }
}
