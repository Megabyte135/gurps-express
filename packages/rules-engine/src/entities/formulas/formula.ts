import type { Decimal } from "../common.js";

/** Human-readable arithmetic expression used by domain entities and external clients. */
export type Formula = string;

/** Scalar values supplied by the aggregate that owns a computed value. */
export type FormulaContext = Readonly<Record<string, Decimal>>;
