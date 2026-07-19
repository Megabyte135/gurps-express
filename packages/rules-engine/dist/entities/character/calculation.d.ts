import type { Decimal, EntityId } from "../common.js";
export interface CalculatedAttribute {
    readonly attributeId: EntityId;
    readonly baseValue: Decimal;
    readonly improvementLevel: Decimal;
    readonly valueBeforeEffects: Decimal;
    readonly valueAfterEffects: Decimal;
}
export interface CalculatedSkill {
    readonly skillId: EntityId;
    readonly baseValue: Decimal;
    readonly improvementLevel: Decimal;
    readonly valueBeforeEffects: Decimal;
    readonly valueAfterEffects: Decimal;
}
export interface CalculatedResource {
    readonly resourceId: EntityId;
    readonly currentValue: Decimal;
    readonly minimumValue: Decimal;
    readonly maximumValue: Decimal;
    readonly reachedThresholdMultipliers: readonly Decimal[];
}
export interface CalculatedHitLocation {
    readonly hitLocationId: EntityId;
    /** Sum of armor and active trait-provided damage resistance. */
    readonly damageResistance: Decimal;
}
export interface CharacterViolation {
    readonly code: "character.point_budget_exceeded" | "character.disadvantage_point_limit_exceeded" | "character.disadvantage_count_limit_exceeded" | "character.prerequisite_not_met" | "character.attribute_improvement_out_of_range" | "character.invalid_formula";
    readonly path: string;
    readonly message: string;
}
export interface CharacterCalculation {
    readonly attributes: readonly CalculatedAttribute[];
    readonly skills: readonly CalculatedSkill[];
    readonly resources: readonly CalculatedResource[];
    readonly hitLocations: readonly CalculatedHitLocation[];
    readonly pointTotal: Decimal;
    readonly inventoryWeight: Decimal;
    readonly violations: readonly CharacterViolation[];
}
//# sourceMappingURL=calculation.d.ts.map