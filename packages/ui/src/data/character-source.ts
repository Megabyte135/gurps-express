import type { CharacterSheetDto } from "./types";

/**
 * Источник данных листа персонажа. Реализации: мок (sources/mock-source.ts)
 * и будущий HttpCharacterSource поверх API. Подмена источника — единственная
 * точка интеграции при подключении реального бэкенда.
 */
export interface CharacterSource {
  getCharacter(id: string): Promise<CharacterSheetDto>;
}

export class CharacterNotFoundError extends Error {
  public constructor(id: string) {
    super(`Character not found: ${id}`);
    this.name = "CharacterNotFoundError";
  }
}
