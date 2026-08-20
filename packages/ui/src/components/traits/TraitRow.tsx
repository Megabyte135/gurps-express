import type { TraitDto } from "../../data/types";
import { useDice, parseDamageDice } from "../../state/dice";

function formatPoints(points: number): string {
  if (points > 0) return `+${points}`;
  if (points < 0) return `−${Math.abs(points)}`;
  return "0";
}

export function TraitRow({
  trait,
  onOpen,
}: {
  readonly trait: TraitDto;
  readonly onOpen: () => void;
}) {
  const dice = useDice();

  const attack = trait.attack;
  const rangedDamage = attack !== null && attack.kind === "ranged" ? parseDamageDice(attack.damage) : null;

  return (
    <div className="list-row">
      {trait.traitKind === "disadvantage" && <span className="trait-dot" aria-hidden />}
      <div className="row-main">
        <div className="row-title">
          <button type="button" className="row-name" title="Подробнее о черте" onClick={onOpen}>
            {trait.name}
          </button>
          {trait.levels !== null && <span className="row-inline">×{trait.levels}</span>}
        </div>
        {trait.notes !== null && <div className="row-note">{trait.notes}</div>}
        {attack !== null && (
          <button
            type="button"
            className={`row-attack${rangedDamage !== null ? " rollable" : ""}`}
            disabled={rangedDamage === null}
            title={rangedDamage !== null ? `Бросить урон: ${rangedDamage}` : undefined}
            onClick={() => {
              if (rangedDamage !== null) {
                dice.requestExpressionRoll(`${trait.name} — урон`, rangedDamage);
              }
            }}
          >
            {attack.kind === "ranged"
              ? `${attack.damage} · Acc ${attack.accuracy ?? "—"} · ${attack.range ?? "—"} · RoF ${attack.rateOfFire ?? "—"} · Rcl ${attack.recoil ?? "—"}`
              : `${attack.damage} · Reach ${attack.reach ?? "—"}`}
          </button>
        )}
      </div>
      <div className="row-side">
        {trait.selfControlRoll !== null && (
          <button
            type="button"
            className="row-cr"
            title={`Бросить самоконтроль против ${trait.selfControlRoll}`}
            onClick={() => dice.requestSuccessRoll(`${trait.name} — самоконтроль`, trait.selfControlRoll)}
          >
            cr {trait.selfControlRoll}
          </button>
        )}
        {trait.points !== null && (
          <span className={`row-points${trait.points < 0 ? " is-negative" : ""}`}>
            {formatPoints(trait.points)}
          </span>
        )}
      </div>
    </div>
  );
}
