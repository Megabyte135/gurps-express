/**
 * Локализация технических тегов каталога. Теги приходят из данных
 * (rules-engine / API); UI показывает локализованные подписи, неизвестный
 * тег отображается как есть.
 */
const TAG_LABELS: Readonly<Record<string, string>> = {
  racial: "расовые",
  magic: "магия",
  mental: "ментальные",
  physical: "физические",
  combat: "боевые",
  social: "социальные",
  sensory: "чувства",
  movement: "движение",
  defense: "защита",
  scouting: "разведка",
  survival: "выживание",
  attack: "атака",
  healing: "лечение",
  utility: "утилита",
  area: "по площади",
  info: "информация",
};

export function tagLabel(tag: string): string {
  return TAG_LABELS[tag] ?? tag;
}

/** Элемент проходит фильтр тегов, если активных тегов нет или пересекается хотя бы один. */
export function matchesTags(itemTags: readonly string[], activeTags: readonly string[]): boolean {
  if (activeTags.length === 0) return true;
  return itemTags.some((tag) => activeTags.includes(tag));
}
