import { useMemo, useState } from "react";
import type { SpellCollegeDto, SpellDto, SpellEntryDto } from "../../data/types";
import { sumSpellPoints } from "../../data/points";
import { matchesTags } from "../../data/tag-labels";
import { useDice } from "../../state/dice";
import { CollapsibleSection } from "../common/CollapsibleSection";
import { SectionSearch } from "../common/SectionSearch";
import { useCollapsed } from "../../hooks/collapsed";
import { Icon } from "../icons/Icon";
import "../common/lists.css";

function spellLabel(spell: SpellDto): string {
  return spell.originalName ?? spell.name;
}

function collectTags(entries: readonly SpellEntryDto[], into: Set<string>): void {
  for (const entry of entries) {
    if (entry.kind === "college") collectTags(entry.spells, into);
    else for (const tag of entry.tags) into.add(tag);
  }
}

function leafMatches(entry: SpellDto, query: string, activeTags: readonly string[]): boolean {
  const byQuery =
    query === "" ||
    entry.name.toLowerCase().includes(query) ||
    (entry.originalName ?? "").toLowerCase().includes(query);
  return byQuery && matchesTags(entry.tags, activeTags);
}

function filterEntries(
  entries: readonly SpellEntryDto[],
  query: string,
  activeTags: readonly string[],
): readonly SpellEntryDto[] {
  if (query === "" && activeTags.length === 0) return entries;
  return entries
    .map((entry) => {
      if (entry.kind === "college") {
        const children = filterEntries(entry.spells, query, activeTags);
        const byOwnName =
          activeTags.length === 0 && entry.name.toLowerCase().includes(query) && query !== "";
        if (children.length === 0 && !byOwnName) return null;
        return { ...entry, spells: children };
      }
      return leafMatches(entry, query, activeTags) ? entry : null;
    })
    .filter((entry): entry is SpellEntryDto => entry !== null);
}

function SpellRow({ spell }: { readonly spell: SpellDto }) {
  const dice = useDice();
  const label = spellLabel(spell);
  const rollTarget = spell.effectiveLevel;

  return (
    <div
      className="list-row rollable"
      role="button"
      tabIndex={0}
      title={rollTarget !== null ? `Бросить 3d6 против ${rollTarget}` : "Открыть панель бросков"}
      onClick={() => dice.requestSuccessRoll(label, rollTarget)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          dice.requestSuccessRoll(label, rollTarget);
        }
      }}
    >
      <div className="row-main">
        <div className="row-title">
          {spell.originalName !== null ? (
            <span className="tip" data-tip={spell.originalName}>{spell.name}</span>
          ) : (
            <span>{spell.name}</span>
          )}
          {spell.notes !== null && <div className="row-note">{spell.notes}</div>}
        </div>
        <div className="row-inline">
          {spell.spellClass} · цена {spell.castingCost} · время {spell.castingTime}
        </div>
      </div>
      <div className="row-side">
        <span className="row-points">[{spell.points}]</span>
        <span className={`row-level${rollTarget === null ? " is-empty" : ""}`}>
          <Icon name="dice" size={11} className="dice-hint" />
          {rollTarget ?? "—"}
        </span>
      </div>
    </div>
  );
}

function SpellCollegeBlock({ college }: { readonly college: SpellCollegeDto }) {
  const { isCollapsed, toggle } = useCollapsed();
  const collapsed = isCollapsed(`spell:${college.id}`, false);
  const points = sumSpellPoints(college.spells);

  return (
    <div className="container-block">
      <button
        type="button"
        className="container-header"
        aria-expanded={!collapsed}
        onClick={() => toggle(`spell:${college.id}`, false)}
      >
        <Icon name="chevron" size={11} className="section-chevron" />
        <span className="container-name">{college.name}</span>
        <span className={`row-points${points < 0 ? " is-negative" : ""}`}>
          {points > 0 ? `+${points}` : points < 0 ? `−${Math.abs(points)}` : "0"}
        </span>
      </button>
      {!collapsed && (
        <div className="container-children">
          {college.spells.map((entry) =>
            entry.kind === "college" ? (
              <SpellCollegeBlock key={entry.id} college={entry} />
            ) : (
              <SpellRow key={entry.id} spell={entry} />
            ),
          )}
        </div>
      )}
    </div>
  );
}

export function SpellSection({ spells }: { readonly spells: readonly SpellEntryDto[] }) {
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<readonly string[]>([]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    collectTags(spells, tags);
    return [...tags];
  }, [spells]);

  const normalizedQuery = query.trim().toLowerCase();
  const visible = filterEntries(spells, normalizedQuery, activeTags);
  const totalPoints = sumSpellPoints(spells);

  return (
    <CollapsibleSection
      id="spells"
      title="Заклинания"
      meta={<span className="section-meta">[{totalPoints}]</span>}
      toolbar={
        <SectionSearch
          value={query}
          onChange={setQuery}
          placeholder="Поиск по заклинаниям…"
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
          entry.kind === "college" ? (
            <SpellCollegeBlock key={entry.id} college={entry} />
          ) : (
            <SpellRow key={entry.id} spell={entry} />
          ),
        )
      )}
    </CollapsibleSection>
  );
}
