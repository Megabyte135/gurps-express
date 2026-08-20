import { useEffect, useRef, useState } from "react";
import { Icon } from "../icons/Icon";
import { useTheme } from "../../hooks/theme";
import type { ThemeName } from "../../hooks/theme";
import "./toolbar.css";

const THEME_OPTIONS: readonly { id: ThemeName; name: string; swatch: readonly [string, string] }[] = [
  { id: "base", name: "Классика", swatch: ["#f7f6f3", "#2f5d8c"] },
  { id: "fantasy", name: "Фэнтези", swatch: ["#f2e9d5", "#8e3b2f"] },
  { id: "scifi", name: "Sci-Fi", swatch: ["#0b0e13", "#56c1ff"] },
];

function ThemePicker() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current !== null && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="theme-picker" ref={rootRef}>
      <button
        type="button"
        className="icon-button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Стиль оформления"
        title="Стиль оформления"
        onClick={() => setOpen((previous) => !previous)}
      >
        <Icon name="palette" />
      </button>
      {open && (
        <div className="theme-menu" role="menu">
          {THEME_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              role="menuitemradio"
              aria-checked={theme === option.id}
              className="theme-option"
              onClick={() => {
                setTheme(option.id);
                setOpen(false);
              }}
            >
              <span className="theme-swatch" aria-hidden>
                <i style={{ background: option.swatch[0] }} />
                <i style={{ background: option.swatch[1] }} />
              </span>
              <span className="theme-option-name">{option.name}</span>
              {theme === option.id && <span className="theme-check" aria-hidden />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ModeToggle() {
  const { mode, toggleMode } = useTheme();
  return (
    <button
      type="button"
      className="icon-button"
      onClick={toggleMode}
      aria-label={mode === "light" ? "Тёмная тема" : "Светлая тема"}
      title={mode === "light" ? "Тёмная тема" : "Светлая тема"}
    >
      <Icon name={mode === "light" ? "moon" : "sun"} />
    </button>
  );
}

interface ToolbarProps {
  readonly characterName: string | null;
  readonly spentPoints: number | null;
  readonly pointBudget: number | null;
  readonly sidebarOpen: boolean;
  readonly onToggleSidebar: () => void;
}

export function Toolbar({
  characterName,
  spentPoints,
  pointBudget,
  sidebarOpen,
  onToggleSidebar,
}: ToolbarProps) {
  const spent = spentPoints ?? 0;
  const budget = pointBudget ?? 0;
  const usedPercent = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;

  return (
    <header className="toolbar">
      <div className="toolbar-brand">
        <span className="toolbar-logo" aria-hidden />
        <span className="toolbar-title">Gurps Express</span>
        {characterName !== null && <span className="toolbar-char">{characterName}</span>}
      </div>

      {(pointBudget !== null || spentPoints !== null) && (
        <div className="toolbar-points tip" data-tip={`Потрачено ${spent} из ${budget} очков`}>
          <span className="toolbar-points-value">
            {spent}
            <span className="toolbar-points-total">/{budget}</span>
          </span>
          <span className="toolbar-points-bar">
            <i style={{ width: `${usedPercent}%` }} />
          </span>
        </div>
      )}

      <div className="toolbar-actions">
        <span className="tip" data-tip="Сохранение появится после подключения API">
          <button type="button" className="icon-button" disabled aria-label="Сохранить">
            <Icon name="save" />
          </button>
        </span>
        <span className="tip" data-tip="История изменений появится позже">
          <button type="button" className="icon-button" disabled aria-label="Отменить">
            <Icon name="undo" />
          </button>
        </span>
        <span className="tip" data-tip="История изменений появится позже">
          <button type="button" className="icon-button" disabled aria-label="Вернуть">
            <Icon name="redo" />
          </button>
        </span>
        <ThemePicker />
        <ModeToggle />
        <button
          type="button"
          className={`btn toolbar-dice${sidebarOpen ? " is-active" : ""}`}
          onClick={onToggleSidebar}
          aria-pressed={sidebarOpen}
        >
          <Icon name="dice" size={15} />
          <span className="toolbar-label">Броски</span>
        </button>
      </div>
    </header>
  );
}
