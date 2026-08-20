import { useDice, parseDamageDice } from "../../state/dice";
import type { CharacterSheetDto } from "../../data/types";
import { CollapsibleSection } from "../common/CollapsibleSection";
import { Icon } from "../icons/Icon";
import "./attributes.css";

export function AttributesSection({ sheet }: { readonly sheet: CharacterSheetDto }) {
  const dice = useDice();
  const { primary, secondary } = sheet.attributes;

  const rollDamage = (label: string, damage: string) => {
    const expression = parseDamageDice(damage);
    if (expression !== null) dice.requestExpressionRoll(label, expression);
  };

  return (
    <CollapsibleSection id="attributes" title="Характеристики">
      <div className="stat-strip">
        {primary.map((attribute) => (
          <div key={attribute.technicalName} className="stat-primary">
            <span className="stat-primary-value">{attribute.value}</span>
            <span className="stat-primary-caption">
              <span className="stat-primary-technical">{attribute.technicalName}</span>
              {attribute.name}
            </span>
          </div>
        ))}
      </div>

      <div className="stat-secondary">
        {secondary.map((attribute) => (
          <div key={attribute.technicalName} className="stat-secondary-cell">
            <span className="stat-secondary-value">{attribute.value}</span>
            <span className="stat-secondary-name">{attribute.name}</span>
          </div>
        ))}
      </div>

      <div className="stat-lift">
        <span className="stat-lift-title">Грузоподъёмность</span>
        <div className="stat-lift-cells">
          {sheet.liftLevels.map((level) => (
            <div key={level.name} className="stat-lift-cell">
              <span className="stat-lift-weight">{level.weightKg}</span>
              <span className="stat-lift-name">{level.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="stat-combat">
        <button
          type="button"
          className="stat-combat-cell rollable"
          title={`Бросить урон: ${sheet.combat.thrust}`}
          onClick={() => rollDamage("Урон толчком", sheet.combat.thrust)}
        >
          <span className="stat-combat-value">{sheet.combat.thrust}</span>
          <span className="stat-combat-name">
            <Icon name="dice" size={10} className="dice-hint" />
            Толчок
          </span>
        </button>
        <button
          type="button"
          className="stat-combat-cell rollable"
          title={`Бросить урон: ${sheet.combat.swing}`}
          onClick={() => rollDamage("Урон замахом", sheet.combat.swing)}
        >
          <span className="stat-combat-value">{sheet.combat.swing}</span>
          <span className="stat-combat-name">
            <Icon name="dice" size={10} className="dice-hint" />
            Замах
          </span>
        </button>
        <button
          type="button"
          className="stat-combat-cell rollable"
          title="Бросить 3d6 против уклонения"
          onClick={() => dice.requestSuccessRoll("Уклонение", sheet.combat.dodge)}
        >
          <span className="stat-combat-value">{sheet.combat.dodge}</span>
          <span className="stat-combat-name">
            <Icon name="dice" size={10} className="dice-hint" />
            Уклонение
          </span>
        </button>
      </div>
    </CollapsibleSection>
  );
}
