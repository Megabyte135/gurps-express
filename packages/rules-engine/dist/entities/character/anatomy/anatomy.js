/** The copied anatomy determines the complete set of available hit locations. */
export class Anatomy {
    id;
    catalogKey;
    name;
    description;
    #hitLocations;
    constructor(input) {
        this.id = input.id;
        this.catalogKey = input.catalogKey;
        this.name = input.name;
        this.description = input.description;
        this.#hitLocations = input.hitLocations;
    }
    static create(input) {
        const validation = validateHitLocationIntersections(input.hitLocations);
        if (!validation.ok)
            return validation;
        return { ok: true, value: new Anatomy({ ...input, hitLocations: validation.value }) };
    }
    get hitLocations() {
        return [...this.#hitLocations];
    }
    setHitLocations(locations) {
        const validation = validateHitLocationIntersections(locations);
        if (!validation.ok)
            return validation;
        this.#hitLocations = validation.value;
        return { ok: true, value: undefined };
    }
    addHitLocation(location) {
        return this.setHitLocations([...this.#hitLocations, location]);
    }
}
function validateHitLocationIntersections(locations) {
    const conflicts = [];
    for (let leftIndex = 0; leftIndex < locations.length; leftIndex += 1) {
        const left = locations[leftIndex];
        if (left === undefined)
            continue;
        const leftRolls = new Set(left.hitOn);
        for (let rightIndex = leftIndex + 1; rightIndex < locations.length; rightIndex += 1) {
            const right = locations[rightIndex];
            if (right === undefined)
                continue;
            const sharedRolls = [...new Set(right.hitOn)]
                .filter((roll) => leftRolls.has(roll))
                .sort((first, second) => first - second);
            if (sharedRolls.length > 0) {
                conflicts.push({
                    left: { id: left.id, name: left.name },
                    right: { id: right.id, name: right.name },
                    hitOn: sharedRolls,
                });
            }
        }
    }
    if (conflicts.length === 0)
        return { ok: true, value: [...locations] };
    const details = conflicts
        .map((conflict) => `${describe(conflict.left)} and ${describe(conflict.right)}: ${conflict.hitOn.join(", ")}`)
        .join("; ");
    return {
        ok: false,
        error: {
            code: "overlapping-hit-on",
            message: `Hit location hitOn values overlap: ${details}.`,
            conflicts,
        },
    };
}
function describe(location) {
    return `"${location.name}" (${location.id})`;
}
//# sourceMappingURL=anatomy.js.map