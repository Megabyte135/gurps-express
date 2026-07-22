import { Decimal as DecimalJs } from "decimal.js";
const DIVISION_DECIMAL_PLACES = 12;
export function normalizeDecimal(value) {
    return format(toDecimal(value));
}
export function compareDecimals(left, right) {
    return toDecimal(left).cmp(toDecimal(right));
}
export function addDecimals(left, right) {
    return format(toDecimal(left).plus(toDecimal(right)));
}
export function subtractDecimals(left, right) {
    return format(toDecimal(left).minus(toDecimal(right)));
}
export function multiplyDecimals(left, right) {
    return format(toDecimal(left).times(toDecimal(right)));
}
export function divideDecimals(left, right) {
    const divisor = toDecimal(right);
    if (divisor.isZero())
        throw new RangeError("A value change cannot divide by zero.");
    return format(toDecimal(left).div(divisor).toDecimalPlaces(DIVISION_DECIMAL_PLACES, DecimalJs.ROUND_HALF_UP));
}
export function powerDecimals(left, right) {
    return format(toDecimal(left).pow(toDecimal(right)));
}
export function absoluteDecimal(value) {
    return format(toDecimal(value).abs());
}
function toDecimal(value) {
    const decimal = new DecimalJs(value);
    if (!decimal.isFinite())
        throw new TypeError(`Invalid decimal value: ${value}`);
    return decimal;
}
function format(value) {
    return value.toFixed();
}
//# sourceMappingURL=decimal.js.map