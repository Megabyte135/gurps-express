export interface CharacterIdentity {
  readonly name: string;
  readonly aliases: readonly string[];
  readonly description: string;
  readonly appearance: string;
  readonly biography: string;
  readonly imageUrl: string | null;
}
