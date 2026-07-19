/** Immutable catalog entity addressed by its stable identifier. */
export interface CatalogDefinition {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly tags: readonly string[];
}
export interface CatalogDefinitionRef {
    readonly id: string;
}
//# sourceMappingURL=catalog-definition.d.ts.map