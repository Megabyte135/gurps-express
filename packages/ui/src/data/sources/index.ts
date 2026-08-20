/**
 * Точка подмены источника данных.
 *
 * Сейчас используется мок. При появлении API достаточно реализовать
 * HttpCharacterSource (fetch → CharacterSheetDto) и вернуть его из
 * createCharacterSource — остальной UI не изменится.
 */
import type { CharacterSource } from "../character-source";
import { MockCharacterSource } from "./mock-source";

export { MockCharacterSource } from "./mock-source";

export function createCharacterSource(): CharacterSource {
  return new MockCharacterSource();
}
