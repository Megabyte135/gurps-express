import { addDecimals, divideDecimals, multiplyDecimals, normalizeDecimal } from "../decimal.js";
/**
 * A value that can be changed over time by reversible mutations.
 * Mutations are stored in an append-only history; computed value is always
 * replayed from baseValue so removal is safe and deterministic.
 */
export class ComputedValue {
    #baseValue;
    #changesList;
    #formulaResolver;
    #context;
    constructor(snapshot, formulaResolver) {
        this.#baseValue = snapshot.baseValue;
        this.#formulaResolver = formulaResolver;
        this.#changesList = [...snapshot.changesList].map(normalizeMutation);
        this.#context = { ...snapshot.context };
        assertUniqueChangeIds(this.#changesList);
        assertContiguousSequence(this.#changesList);
    }
    get baseValue() { return this.#baseValue; }
    get value() {
        return replay(normalizeDecimal(this.#formulaResolver.resolve(this.#baseValue, this.#context)), this.#changesList);
    }
    get changesList() { return this.#changesList.map(cloneMutation); }
    get context() { return { ...this.#context }; }
    applyMutation(input) {
        if (this.#changesList.some((change) => change.id === input.id)) {
            throw new Error(`A change with id ${input.id} already exists.`);
        }
        const change = normalizeMutation({ ...input, sequence: this.#changesList.length + 1 });
        this.#changesList.push(change);
        return cloneMutation(change);
    }
    removeMutation(changeId) {
        const index = this.#changesList.findIndex((change) => change.id === changeId);
        if (index === -1)
            return false;
        this.#changesList.splice(index, 1);
        this.#changesList.forEach((change, position) => {
            this.#changesList[position] = { ...change, sequence: position + 1 };
        });
        return true;
    }
    /** Replaces the baseline formula while preserving all explicit changes. */
    rebase(baseValue) {
        this.#baseValue = baseValue;
    }
    setContext(context) {
        this.#context = { ...context };
    }
    toSnapshot() {
        return { baseValue: this.#baseValue, changesList: this.changesList, context: this.context };
    }
}
function normalizeMutation(change) {
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
function cloneMutation(change) {
    return { ...change, source: { ...change.source } };
}
function assertUniqueChangeIds(changes) {
    if (new Set(changes.map((change) => change.id)).size !== changes.length) {
        throw new Error("Change identifiers must be unique.");
    }
}
function assertContiguousSequence(changes) {
    const ordered = [...changes].sort((left, right) => left.sequence - right.sequence);
    if (ordered.some((change, index) => change.sequence !== index + 1)) {
        throw new Error("Change sequences must start at 1 and be contiguous.");
    }
}
function replay(baseValue, changes) {
    return [...changes].sort((left, right) => left.sequence - right.sequence)
        .reduce((value, change) => applyMutation(value, change), baseValue);
}
function applyMutation(value, change) {
    switch (change.operand) {
        case "add": return addDecimals(value, change.magnitude);
        case "multiply": return multiplyDecimals(value, change.magnitude);
        case "divide": return divideDecimals(value, change.magnitude);
    }
}
//# sourceMappingURL=computed-value.js.map