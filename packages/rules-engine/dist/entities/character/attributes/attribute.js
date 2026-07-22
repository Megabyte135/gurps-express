import { Entity } from "../../common.js";
/** One configurable attribute shared by character presets and characters. */
export class Attribute extends Entity {
    type = "attribute";
    catalogKey;
    name;
    description;
    tags;
    maximumValue;
    positiveImprovement;
    negativeImprovement;
    #minValue;
    #calculation;
    #value;
    constructor(input) {
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
        if (input.calculation !== null)
            this.#value.rebase(input.calculation);
    }
    get kind() {
        return this.#calculation === null ? "primary" : "secondary";
    }
    get minValue() { return this.#minValue; }
    set minValue(value) { this.#minValue = assertNonNegativeDecimal(value); }
    get calculation() { return this.#calculation; }
    set calculation(value) {
        this.#calculation = value;
        if (value !== null)
            this.#value.rebase(value);
    }
    get value() { return this.#value; }
    set value(value) {
        this.#value = value;
        if (this.#calculation !== null)
            this.#value.rebase(this.#calculation);
    }
}
function assertNonNegativeDecimal(value) {
    if (!/^-?(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(value)) {
        throw new TypeError(`Invalid decimal value: ${value}`);
    }
    if (value.startsWith("-"))
        throw new RangeError("An attribute minimum value cannot be negative.");
    return value;
}
//# sourceMappingURL=attribute.js.map