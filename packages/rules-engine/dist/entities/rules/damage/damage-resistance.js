/** Damage resistance entries grouped by damage source and damage type. */
export class DamageResistance {
    damageType;
    source;
    #entries;
    constructor(input, entries) {
        this.damageType = input.damageType;
        this.source = input.source;
        this.#entries = entries;
    }
    static create(input) {
        const validation = validateHitLocationDamageResistanceValues(input.hitLocationDamageResistances);
        if (!validation.ok)
            return validation;
        return {
            ok: true,
            value: new DamageResistance(input, validation.value),
        };
    }
    get hitLocationDamageResistances() {
        return [...this.#entries];
    }
    setHitLocationDamageResistances(entries) {
        const validation = validateHitLocationDamageResistanceValues(entries);
        if (!validation.ok)
            return validation;
        this.#entries = validation.value;
        return { ok: true, value: undefined };
    }
    addHitLocationDamageResistance(entry) {
        return this.setHitLocationDamageResistances([...this.#entries, entry]);
    }
    getAggregatedDamageResistance() {
        const totals = new Map();
        for (const entry of this.#entries) {
            const current = totals.get(entry.hitLocation.id);
            if (current === undefined) {
                totals.set(entry.hitLocation.id, { ...entry });
                continue;
            }
            totals.set(entry.hitLocation.id, {
                ...current,
                value: current.value + entry.value,
            });
        }
        return [...totals.values()];
    }
}
function validateHitLocationDamageResistanceValues(entries) {
    if (!Array.isArray(entries)) {
        return {
            ok: false,
            error: {
                code: "invalid-damage-resistance-value",
                message: "Damage resistance values must be an array.",
                invalidValues: [entries],
            },
        };
    }
    const invalidValues = [];
    const validEntries = [];
    for (const entry of entries) {
        if (!isPositiveNumber(entry.value)) {
            invalidValues.push(entry.value);
            continue;
        }
        validEntries.push(entry);
    }
    if (invalidValues.length > 0) {
        return {
            ok: false,
            error: {
                code: "invalid-damage-resistance-value",
                message: "Damage resistance value must be a positive number.",
                invalidValues,
            },
        };
    }
    return { ok: true, value: validEntries };
}
function isPositiveNumber(value) {
    return Number.isFinite(value) && value > 0;
}
//# sourceMappingURL=damage-resistance.js.map