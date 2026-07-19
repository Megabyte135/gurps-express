import type { Decimal } from "../../common.js";
export interface WeaponMode {
    readonly id: string;
    readonly name: string;
    readonly usage: "melee" | "ranged";
    readonly skillId: string;
    readonly damage: string;
    readonly damageType: string;
    readonly reach: string | null;
    readonly accuracy: Decimal | null;
    readonly range: string | null;
    readonly rateOfFire: string | null;
    readonly shots: string | null;
    readonly bulk: Decimal | null;
}
//# sourceMappingURL=weapon-mode.d.ts.map