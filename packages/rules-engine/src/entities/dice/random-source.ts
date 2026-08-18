import { randomInt } from "node:crypto";

/** Inclusive uniform integer source that can be replaced in tests. */
export interface RandomSource {
  nextInt(min: number, max: number): number;
}

/** Production random source backed by cryptographically secure randomness. */
export class CryptoRandomSource implements RandomSource {
  public nextInt(min: number, max: number): number {
    return randomInt(min, max + 1);
  }
}
