import type { CharacterSheetDto, SpellEntryDto, TraitEntryDto } from "./types";

export function sumTraitPoints(entries: readonly TraitEntryDto[]): number {
  return entries.reduce(
    (sum, entry) => sum + (entry.kind === "container" ? sumTraitPoints(entry.entries) : (entry.points ?? 0)),
    0,
  );
}

export function sumSpellPoints(entries: readonly SpellEntryDto[]): number {
  return entries.reduce(
    (sum, entry) => sum + (entry.kind === "college" ? sumSpellPoints(entry.spells) : entry.points),
    0,
  );
}

export function computeSpentPoints(sheet: CharacterSheetDto): number {
  const skillPoints = sheet.skills.reduce((sum, skill) => sum + skill.points, 0);
  return sumTraitPoints(sheet.traits) + skillPoints + sumSpellPoints(sheet.spells);
}
