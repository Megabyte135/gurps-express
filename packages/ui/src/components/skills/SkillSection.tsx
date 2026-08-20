import { useMemo, useState } from "react";
import type { SkillDto } from "../../data/types";
import { matchesTags } from "../../data/tag-labels";
import { useDice } from "../../state/dice";
import { CollapsibleSection } from "../common/CollapsibleSection";
import { SectionSearch } from "../common/SectionSearch";
import { Icon } from "../icons/Icon";
import "../common/lists.css";

function skillMatches(skill: SkillDto, query: string, activeTags: readonly string[]): boolean {
  const byQuery =
    query === "" ||
    skill.name.toLowerCase().includes(query) ||
    (skill.specialization ?? "").toLowerCase().includes(query) ||
    (skill.originalName ?? "").toLowerCase().includes(query);
  return byQuery && matchesTags(skill.tags, activeTags);
}

export function SkillSection({ skills }: { readonly skills: readonly SkillDto[] }) {
  const dice = useDice();
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<readonly string[]>([]);

  const allTags = useMemo(() => [...new Set(skills.flatMap((skill) => skill.tags))], [skills]);
  const normalizedQuery = query.trim().toLowerCase();
  const visible = skills.filter((skill) => skillMatches(skill, normalizedQuery, activeTags));
  const totalPoints = skills.reduce((sum, skill) => sum + skill.points, 0);

  return (
    <CollapsibleSection
      id="skills"
      title="Умения"
      meta={<span className="section-meta">[{totalPoints}]</span>}
      toolbar={
        <SectionSearch
          value={query}
          onChange={setQuery}
          placeholder="Поиск по умениям…"
          tags={allTags}
          activeTags={activeTags}
          onTagsChange={setActiveTags}
        />
      }
    >
      {visible.length === 0 ? (
        <div className="empty-note">Ничего не найдено.</div>
      ) : (
        visible.map((skill) => {
          const label = `${skill.name}${skill.specialization !== null ? ` (${skill.specialization})` : ""}`;
          return (
            <div
              key={skill.id}
              className="list-row rollable"
              role="button"
              tabIndex={0}
              title={`Бросить 3d6 против ${skill.effectiveLevel}`}
              onClick={() => dice.requestSuccessRoll(label, skill.effectiveLevel)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  dice.requestSuccessRoll(label, skill.effectiveLevel);
                }
              }}
            >
              <div className="row-main">
                <div className="row-title">
                  <span>
                    {skill.name}
                    {skill.specialization !== null && (
                      <span className="row-inline"> ({skill.specialization})</span>
                    )}
                  </span>
                  <span className="row-inline">
                    {skill.attribute}/{skill.difficulty}
                  </span>
                </div>
                {skill.notes !== null && <div className="row-note">{skill.notes}</div>}
              </div>
              <div className="row-side">
                <span className="row-points">[{skill.points}]</span>
                <span className="row-level">
                  <Icon name="dice" size={11} className="dice-hint" />
                  {skill.effectiveLevel}
                </span>
              </div>
            </div>
          );
        })
      )}
    </CollapsibleSection>
  );
}
