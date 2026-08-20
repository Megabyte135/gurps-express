import { useEffect, useRef, useState } from "react";
import { Icon } from "../icons/Icon";
import { tagLabel } from "../../data/tag-labels";

interface SectionSearchProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  /** Все теги раздела (для чипов фильтра). */
  readonly tags: readonly string[];
  readonly activeTags: readonly string[];
  readonly onTagsChange: (tags: readonly string[]) => void;
}

export function SectionSearch({
  value,
  onChange,
  placeholder,
  tags,
  activeTags,
  onTagsChange,
}: SectionSearchProps) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const active = open || value !== "" || activeTags.length > 0;

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const toggleTag = (tag: string) => {
    onTagsChange(activeTags.includes(tag) ? activeTags.filter((item) => item !== tag) : [...activeTags, tag]);
  };

  return (
    <div className={`section-search${active ? " is-active" : ""}`}>
      <button
        type="button"
        className="icon-button"
        aria-label={active ? "Скрыть поиск" : "Поиск и фильтры раздела"}
        onClick={() => setOpen((previous) => !previous)}
      >
        <Icon name="search" size={14} />
      </button>
      <input
        ref={inputRef}
        type="search"
        value={value}
        placeholder={placeholder ?? "Поиск…"}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            if (value !== "") onChange("");
            else if (activeTags.length > 0) onTagsChange([]);
            else setOpen(false);
          }
        }}
      />
      {tags.length > 0 && (
        <div className="search-tags" aria-label="Фильтр по тегам">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`search-tag${activeTags.includes(tag) ? " is-active" : ""}`}
              aria-pressed={activeTags.includes(tag)}
              onClick={() => toggleTag(tag)}
            >
              {tagLabel(tag)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
