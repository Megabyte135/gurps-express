import { CharacterNotFoundError } from "../character-source";
import type { CharacterSource } from "../character-source";
import type { CharacterSheetDto } from "../types";
import { besSheet } from "../mock/bes";

const NETWORK_DELAY_MS = 250;

export class MockCharacterSource implements CharacterSource {
  readonly #characters: ReadonlyMap<string, CharacterSheetDto>;

  public constructor(
    characters: ReadonlyMap<string, CharacterSheetDto> = new Map([[besSheet.id, besSheet]]),
  ) {
    this.#characters = characters;
  }

  public async getCharacter(id: string): Promise<CharacterSheetDto> {
    await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS));
    const sheet = this.#characters.get(id);
    if (sheet === undefined) throw new CharacterNotFoundError(id);
    return structuredClone(sheet);
  }
}
