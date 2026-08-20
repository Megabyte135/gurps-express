import { useEffect } from "react";
import type { TraitDto } from "../../data/types";
import { useDice } from "../../state/dice";
import { tagLabel } from "../../data/tag-labels";
import { Icon } from "../icons/Icon";
import "./trait-drawer.css";

interface TraitDrawerProps {
  readonly trait: TraitDto | null;
  readonly onClose: () => void;
}

function formatSigned(value: number): string {
  return value > 0 ? `+${value}` : value < 0 ? `−${Math.abs(value)}` : "0";
}

/** Человекочитаемый разбор итоговой стоимости. */
function CostBreakdown({ trait }: { readonly trait: TraitDto }) {
  if (trait.points === null && trait.basePoints === null) {
    return <span className="drawer-cost-note">Стоимость задаётся кампанией</span>;
  }

  const parts: string[] = [];
  if (trait.basePoints !== null) {
    parts.push(trait.levels !== null ? `${trait.basePoints}/ур. × ${trait.levels}` : `${formatSigned(trait.basePoints)}`);
  }
  const percents = trait.modifiers
    .map((modifier) => modifier.costPercent)
    .filter((percent): percent is number => percent !== null);
  if (percents.length > 0) {
    const totalPercent = percents.reduce((sum, percent) => sum + percent, 0);
    parts.push(`${totalPercent > 0 ? "+" : ""}${totalPercent}%`);
  }

  return (
    <div className="drawer-cost">
      {parts.length > 0 && <span className="drawer-cost-formula">{parts.join(" → ")}</span>}
      {trait.points !== null && (
        <span className={`drawer-cost-total${trait.points < 0 ? " is-negative" : ""}`}>
          {formatSigned(trait.points)} очк.
        </span>
      )}
    </div>
  );
}

export function TraitDrawer({ trait, onClose }: TraitDrawerProps) {
  const dice = useDice();

  useEffect(() => {
    if (trait === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [trait, onClose]);

  if (trait === null) return null;

  const attack = trait.attack;

  return (
    <div className="drawer-root">
      <button
        type="button"
        className="drawer-backdrop"
        aria-label="Закрыть описание черты"
        onClick={onClose}
      />
      <aside className="drawer" role="dialog" aria-label={`Черта: ${trait.name}`}>
        <header className="drawer-header">
          <div className="drawer-titles">
            <h3 className="drawer-name">{trait.name}</h3>
            <span className="drawer-subtitle">
              {trait.originalName !== null && <span className="drawer-original">{trait.originalName}</span>}
              <span className={`drawer-kind is-${trait.traitKind}`}>
                {trait.traitKind === "advantage" ? "Преимущество" : "Недостаток"}
              </span>
            </span>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="Закрыть"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </header>

        <div className="drawer-body">
          <CostBreakdown trait={trait} />

          <dl className="drawer-facts">
            {trait.levels !== null && (
              <div className="drawer-fact">
                <dt>Уровни</dt>
                <dd>{trait.levels}</dd>
              </div>
            )}
            {trait.selfControlRoll !== null && (
              <div className="drawer-fact">
                <dt>Самоконтроль</dt>
                <dd>
                  <button
                    type="button"
                    className="row-cr"
                    onClick={() =>
                      dice.requestSuccessRoll(`${trait.name} — самоконтроль`, trait.selfControlRoll)
                    }
                  >
                    cr {trait.selfControlRoll}
                  </button>
                </dd>
              </div>
            )}
          </dl>

          {trait.modifiers.length > 0 && (
            <section className="drawer-block">
              <h4 className="drawer-block-title">Модификаторы</h4>
              <ul className="drawer-modifiers">
                {trait.modifiers.map((modifier) => (
                  <li key={modifier.name}>
                    <span>{modifier.name}</span>
                    {modifier.costPercent !== null && (
                      <span className={modifier.costPercent < 0 ? "is-negative" : ""}>
                        {modifier.costPercent}%
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {attack !== null && (
            <section className="drawer-block">
              <h4 className="drawer-block-title">Атака</h4>
              {attack.kind === "ranged" ? (
                <ul className="drawer-attack">
                  <li>
                    <b>Урон</b> {attack.damage}
                  </li>
                  <li>
                    <b>Точность</b> +{attack.accuracy ?? "—"}
                  </li>
                  <li>
                    <b>Дистанция</b> {attack.range ?? "—"}
                  </li>
                  <li>
                    <b>Темп</b> {attack.rateOfFire ?? "—"}
                  </li>
                  <li>
                    <b>Отдача</b> {attack.recoil ?? "—"}
                  </li>
                </ul>
              ) : (
                <ul className="drawer-attack">
                  <li>
                    <b>Урон</b> {attack.damage}
                  </li>
                  <li>
                    <b>Дистанция</b> {attack.reach ?? "—"}
                  </li>
                </ul>
              )}
            </section>
          )}

          {trait.notes !== null && (
            <section className="drawer-block">
              <h4 className="drawer-block-title">Заметки</h4>
              <p className="drawer-text">{trait.notes}</p>
            </section>
          )}

          {trait.description !== null && (
            <section className="drawer-block">
              <h4 className="drawer-block-title">Описание</h4>
              <p className="drawer-text">{trait.description}</p>
            </section>
          )}

          {trait.tags.length > 0 && (
            <div className="drawer-tags">
              {trait.tags.map((tag) => (
                <span key={tag} className="drawer-tag">
                  {tagLabel(tag)}
                </span>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
