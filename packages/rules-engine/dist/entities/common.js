/** Base identity for any persisted object in the character aggregate. */
export class Entity {
    id;
    #technicalName;
    constructor(id, technicalName) {
        this.id = id;
        this.#technicalName = assertTechnicalName(technicalName);
    }
    get technicalName() {
        return this.#technicalName;
    }
    set technicalName(value) {
        this.#technicalName = assertTechnicalName(value);
    }
}
function assertTechnicalName(value) {
    if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(value)) {
        throw new Error("technicalName must be English, start with a letter, and contain no spaces.");
    }
    return value;
}
//# sourceMappingURL=common.js.map