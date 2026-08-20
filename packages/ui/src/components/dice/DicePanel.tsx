import { useDice } from "../../state/dice";
import type { DiceHistoryEntry } from "../../state/dice";
import { Icon } from "../icons/Icon";
import "./dice-panel.css";

const PIP_LAYOUTS: Readonly<Record<number, readonly number[]>> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function DieFace({
  value,
  selected,
  rolling,
  onSelect,
}: {
  readonly value: number;
  readonly selected: boolean;
  readonly rolling: boolean;
  readonly onSelect: () => void;
}) {
  const pips = PIP_LAYOUTS[value] ?? [];
  return (
    <button
      type="button"
      className={`die-face${selected ? " is-selected" : ""}${rolling ? " is-rolling" : ""}`}
      title={selected ? "Убрать из переброса" : "Перебросить этот кубик"}
      onClick={onSelect}
    >
      <span className="die-pips" aria-hidden>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((cell) => (
          <i key={cell} className={pips.includes(cell) ? "on" : undefined} />
        ))}
      </span>
      <span className="die-value">{value}</span>
    </button>
  );
}

function criticalityLabel(total: number): string | null {
  if (total <= 4) return "крит. успех";
  if (total >= 17) return "крит. провал";
  return null;
}

function HistoryRow({ entry }: { readonly entry: DiceHistoryEntry }) {
  return (
    <li className={`history-row${entry.outcome !== null ? ` is-${entry.outcome}` : ""}`}>
      <span className="history-label">{entry.label}</span>
      <span className="history-dice">{entry.dice.join(" ")}</span>
      <span className="history-total">
        {entry.total}
        {entry.outcome === "success" && entry.margin !== null ? ` +${entry.margin}` : ""}
        {entry.outcome === "failure" && entry.margin !== null ? ` ${entry.margin}` : ""}
      </span>
    </li>
  );
}

export function DicePanel() {
  const dice = useDice();
  const current = dice.current;
  const successRoll = current !== null && current.kind === "success" ? current : null;
  const expressionRoll = current !== null && current.kind === "expression" ? current : null;

  return (
    <div className="dice-panel">
      <div className="dice-block-title">Бросок</div>

      <div className="dice-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={dice.mode === "success"}
          className={dice.mode === "success" ? "is-active" : undefined}
          onClick={() => dice.setMode("success")}
        >
          Проверка 3d6
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={dice.mode === "expression"}
          className={dice.mode === "expression" ? "is-active" : undefined}
          onClick={() => dice.setMode("expression")}
        >
          Свободный
        </button>
      </div>

      {dice.mode === "success" ? (
        <div className="dice-form">
          {dice.label !== "" && <p className="dice-label">{dice.label}</p>}
          <label className="dice-field">
            <span>Цель</span>
            <input
              type="number"
              value={dice.targetText}
              placeholder="напр. 14"
              onChange={(event) => dice.setTargetText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") dice.submitSuccessRoll();
              }}
            />
          </label>
          <label className="dice-field">
            <span>Модификаторы</span>
            <input
              type="text"
              value={dice.modifiersText}
              placeholder="напр. +2 или -1"
              onChange={(event) => dice.setModifiersText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") dice.submitSuccessRoll();
              }}
            />
          </label>
          <button type="button" className="btn-primary" onClick={dice.submitSuccessRoll}>
            Бросить 3d6
          </button>
        </div>
      ) : (
        <div className="dice-form">
          <label className="dice-field">
            <span>Выражение</span>
            <input
              type="text"
              value={dice.expressionText}
              placeholder="напр. 2d+1 или 1d-3"
              onChange={(event) => dice.setExpressionText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") dice.submitExpressionRoll();
              }}
            />
          </label>
          <button type="button" className="btn-primary" onClick={dice.submitExpressionRoll}>
            Бросить
          </button>
        </div>
      )}

      {dice.error !== null && <p className="dice-error">{dice.error}</p>}

      {current !== null && (
        <div className="dice-result">
          <div className="dice-faces">
            {current.result.dice.map((die) => (
              <DieFace
                key={die.index}
                value={dice.rolling ? (dice.rollingValues[die.index] ?? die.value) : die.value}
                selected={dice.selectedDice.includes(die.index)}
                rolling={dice.rolling}
                onSelect={() => dice.toggleDie(die.index)}
              />
            ))}
          </div>

          {successRoll !== null && !dice.rolling && (
            <div className={`dice-verdict is-${successRoll.result.outcome}`}>
              <span className="dice-verdict-total">{Number(successRoll.result.total)}</span>
              <span className="dice-verdict-detail">
                {successRoll.result.outcome === "success" ? "успех" : "провал"}
                {criticalityLabel(Number(successRoll.result.total)) !== null &&
                  ` · ${criticalityLabel(Number(successRoll.result.total))}`}
                {successRoll.modifiers !== "" ? ` · ${successRoll.modifiers}` : ""} · запас{" "}
                {Number(successRoll.result.margin) > 0 ? "+" : ""}
                {Number(successRoll.result.margin)}
              </span>
            </div>
          )}

          {expressionRoll !== null && !dice.rolling && (
            <div className="dice-verdict is-expression">
              <span className="dice-verdict-total">{Number(expressionRoll.result.total)}</span>
              <span className="dice-verdict-detail">{expressionRoll.expression}</span>
            </div>
          )}

          <button
            type="button"
            className="btn dice-reroll"
            disabled={dice.selectedDice.length === 0}
            onClick={dice.rerollSelected}
          >
            <Icon name="reset" size={13} />
            Перебросить выбранные ({dice.selectedDice.length})
          </button>
        </div>
      )}

      {dice.history.length > 0 && (
        <div className="dice-history">
          <div className="dice-history-head">
            <span>История</span>
            <button type="button" onClick={dice.clearHistory}>
              очистить
            </button>
          </div>
          <ul>
            {dice.history.map((entry) => (
              <HistoryRow key={entry.id} entry={entry} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
