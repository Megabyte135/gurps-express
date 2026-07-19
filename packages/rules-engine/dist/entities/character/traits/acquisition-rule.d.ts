import type { Decimal } from "../../common.js";
export type AcquisitionMode = "level" | "points";
export interface AcquisitionRule {
    readonly mode: AcquisitionMode;
    readonly minimum: Decimal;
    readonly maximum: Decimal | null;
    readonly increment: Decimal;
}
//# sourceMappingURL=acquisition-rule.d.ts.map