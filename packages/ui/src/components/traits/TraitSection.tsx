import { useMemo, useState } from "react";
import type { TraitContainerDto, TraitDto, TraitEntryDto } from "../../data/types";
import { sumTraitPoints } from "../../data/points";
import { matchesTags } from "../../data/tag-labels";
import { CollapsibleSection } from "../common/CollapsibleSection";
import { SectionSearch } from "../common/SectionSearch";
import { useCollapsed } from "../../hooks/collapsed";
import { Icon } from "../icons/Icon";
import { TraitRow } from "./TraitRow";
import { TraitDrawer } from "./TraitDrawer";
import "../common/lists.css";
import "./traits.css";

interface TraitSectionProps {
  readonly entries: readonly TraitEntryDto[];
}

function collectTags(entries: readonly TraitEntryDto[], into: Set<string>): void {
  for (const entry of entries) {
    if (entry.kind === "container") collectTags(entry.entries, into);
    else for (const tag of entry.tags) into.add(tag);
  }
}

function leafMatches(entry: TraitDto, query: string, activeTags: readonly string[]): boolean {
  const byQuery =
    query === "" ||
    entry.name.toLowerCase().includes(query) ||
    (entry.originalName ?? "").toLowerCase().includes(query);
  return byQuery && matchesTags(entry.tags, activeTags);
}

function filterEntries(
  entries: readonly TraitEntryDto[],
  query: string,
  activeTags: readonly string[],
): readonly TraitEntryDto[] {
  if (query === "" && activeTags.length === 0) return entries;
  return entries
    .map((entry) => {
      if (entry.kind === "container") {
        const children = filterEntries(entry.entries, query, activeTags);
        const byOwnName =
          activeTags.length === 0 && entry.name.toLowerCase().includes(query) && query !== "";
        if (children.length === 0 && !byOwnName) return null;
        return { ...entry, entries: children };
      }
      return leafMatches(entry, query, activeTags) ? entry : null;
    })
    .filter((entry): entry is TraitEntryDto => entry !== null);
}

function findTrait(entries: readonly TraitEntryDto[], id: string): TraitDto | null {
  for (const entry of entries) {
    if (entry.kind === "container") {
      const found = findTrait(entry.entries, id);
      if (found !== null) return found;
    } else if (entry.id === id) return entry;
  }
  return null;
}

function TraitContainerBlock({
  container,
  onOpenTrait,
}: {
  readonly container: TraitContainerDto;
  readonly onOpenTrait: (id: string) => void;
}) {
  const { isCollapsed, toggle } = useCollapsed();
  const collapsed = isCollapsed(`trait:${container.id}`, false);
  const points = sumTraitPoints(container.entries);

  return (
    <div className="container-block">
      <button
        type="button"
        className="container-header"
        aria-expanded={!collapsed}
        onClick={() => toggle(`trait:${container.id}`, false)}
      >
        <Icon name="chevron" size={11} className="section-chevron" />
        <span className="container-name">{container.name}</span>
        {container.note !== null && <span className="container-note">{container.note}</span>}
        <span className={`row-points${points < 0 ? " is-negative" : ""}`}>
          {points > 0 ? `+${points}` : points < 0 ? `−${Math.abs(points)}` : "0"}
        </span>
      </button>
      {!collapsed && (
        <div className="container-children">
          {container.entries.map((entry) =>
            entry.kind === "container" ? (
              <TraitContainerBlock key={entry.id} container={entry} onOpenTrait={onOpenTrait} />
            ) : (
              <TraitRow key={entry.id} trait={entry} onOpen={() => onOpenTrait(entry.id)} />
            ),
          )}
        </div>
      )}
    </div>
  );
}

export function TraitSection({ entries }: TraitSectionProps) {
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<readonly string[]>([]);
  const [selectedTraitId, setSelectedTraitId] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    collectTags(entries, tags);
    return [...tags];
  }, [entries]);

  const normalizedQuery = query.trim().toLowerCase();
  const visible = filterEntries(entries, normalizedQuery, activeTags);
  const total = sumTraitPoints(entries);
  const selectedTrait = selectedTraitId === null ? null : findTrait(entries, selectedTraitId);

  return (
    <>
      <CollapsibleSection
        id="traits"
        title="Преимущества и недостатки"
        meta={
          <span className={`section-meta${total < 0 ? " is-negative" : ""}`}>
            {total > 0 ? `+${total}` : total < 0 ? `−${Math.abs(total)}` : "0"} очков
          </span>
        }
        toolbar={
          <SectionSearch
            value={query}
            onChange={setQuery}
            placeholder="Поиск по чертам…"
            tags={allTags}
            activeTags={activeTags}
            onTagsChange={setActiveTags}
          />
        }
      >
        {visible.length === 0 ? (
          <div className="empty-note">Ничего не найдено.</div>
        ) : (
          visible.map((entry) =>
            entry.kind === "container" ? (
              <TraitContainerBlock
                key={entry.id}
                container={entry}
                onOpenTrait={setSelectedTraitId}
              />
            ) : (
              <TraitRow key={entry.id} trait={entry} onOpen={() => setSelectedTraitId(entry.id)} />
            ),
          )
        )}
      </CollapsibleSection>
      <TraitDrawer trait={selectedTrait} onClose={() => setSelectedTraitId(null)} />
    </>
  );
}
