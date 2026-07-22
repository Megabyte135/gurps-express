import type { Result } from "../../common.js";
import type { HitLocation } from "../../character/anatomy/hit-location.js";
import type { DamageType } from "./damage-type.js";
export interface HitLocationDamageResistance {
    readonly hitLocation: HitLocation;
    readonly value: number;
}
export interface HitLocationDamageResistanceInput {
    readonly hitLocation: HitLocation;
    readonly value: number;
}
export interface DamageResistanceInput {
    readonly damageType: DamageType;
    readonly source: string;
    readonly hitLocationDamageResistances: readonly HitLocationDamageResistanceInput[];
}
export interface InvalidDamageResistanceValueError {
    readonly code: "invalid-damage-resistance-value";
    readonly message: string;
    readonly invalidValues: readonly unknown[];
}
export interface AggregatedHitLocationDamageResistance {
    readonly hitLocation: HitLocation;
    readonly value: number;
}
/** Damage resistance entries grouped by damage source and damage type. */
export declare class DamageResistance {
    #private;
    readonly damageType: DamageType;
    readonly source: string;
    private constructor();
    static create(input: DamageResistanceInput): Result<DamageResistance, InvalidDamageResistanceValueError>;
    get hitLocationDamageResistances(): readonly HitLocationDamageResistance[];
    setHitLocationDamageResistances(entries: readonly HitLocationDamageResistanceInput[]): Result<void, InvalidDamageResistanceValueError>;
    addHitLocationDamageResistance(entry: HitLocationDamageResistanceInput): Result<void, InvalidDamageResistanceValueError>;
    getAggregatedDamageResistance(): readonly AggregatedHitLocationDamageResistance[];
}
//# sourceMappingURL=damage-resistance.d.ts.map