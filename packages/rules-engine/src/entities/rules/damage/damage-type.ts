export interface DamageTypeMultiplier {
  readonly multiplier: number;
  readonly name: string;
  readonly description: string;
}

export interface DamageType {
  readonly name: string;
  readonly description: string;
  readonly multipliers: readonly DamageTypeMultiplier[];
}
