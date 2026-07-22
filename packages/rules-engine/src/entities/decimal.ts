import DecimalJs from "decimal.js";
import type { Decimal } from "./common.js";

const DIVISION_DECIMAL_PLACES = 12;

export function normalizeDecimal(value: Decimal): Decimal {
  return format(toDecimal(value));
}

export function compareDecimals(left: Decimal, right: Decimal): number {
  return toDecimal(left).cmp(toDecimal(right));
}

export function addDecimals(left: Decimal, right: Decimal): Decimal {
  return format(toDecimal(left).plus(toDecimal(right)));
}

export function subtractDecimals(left: Decimal, right: Decimal): Decimal {
  return format(toDecimal(left).minus(toDecimal(right)));
}

export function multiplyDecimals(left: Decimal, right: Decimal): Decimal {
  return format(toDecimal(left).times(toDecimal(right)));
}

export function divideDecimals(left: Decimal, right: Decimal): Decimal {
  const divisor = toDecimal(right);
  if (divisor.isZero()) throw new RangeError("A value change cannot divide by zero.");
  return format(toDecimal(left).div(divisor).toDecimalPlaces(DIVISION_DECIMAL_PLACES, DecimalJs.ROUND_HALF_UP));
}

export function powerDecimals(left: Decimal, right: Decimal): Decimal {
  return format(toDecimal(left).pow(toDecimal(right)));
}

export function absoluteDecimal(value: Decimal): Decimal {
  return format(toDecimal(value).abs());
}

function toDecimal(value: Decimal): DecimalJs {
  const decimal = new DecimalJs(value);
  if (!decimal.isFinite()) throw new TypeError(`Invalid decimal value: ${value}`);
  return decimal;
}

function format(value: DecimalJs): Decimal {
  return value.toFixed();
}
