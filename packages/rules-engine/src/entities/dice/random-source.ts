/** Inclusive uniform integer source that can be replaced in tests. */
export interface RandomSource {
  nextInt(min: number, max: number): number;
}

/**
 * Production random source backed by cryptographically secure randomness.
 * Uses the Web Crypto API available in browsers, Node, and workers alike.
 */
export class CryptoRandomSource implements RandomSource {
  public nextInt(min: number, max: number): number {
    const range = max - min + 1;
    if (!Number.isInteger(range) || range <= 0) {
      throw new RangeError(`nextInt expects min <= max with an integer range, got ${min}..${max}.`);
    }
    const limit = Math.floor(0x100000000 / range) * range;
    const buffer = new Uint32Array(1);
    let value: number;
    do {
      globalThis.crypto.getRandomValues(buffer);
      value = buffer[0] ?? 0;
    } while (value >= limit);
    return min + (value % range);
  }
}
