import type { EquipmentItemDto } from "../../data/types";
import { CollapsibleSection } from "../common/CollapsibleSection";
import "../common/lists.css";

const STATE_LABELS: Readonly<Record<EquipmentItemDto["state"], string>> = {
  worn: "надето",
  carried: "с собой",
  stored: "в хранилище",
};

export function EquipmentSection({ equipment }: { readonly equipment: readonly EquipmentItemDto[] }) {
  return (
    <CollapsibleSection id="equipment" title="Снаряжение" defaultCollapsed>
      {equipment.length === 0 ? (
        <div className="empty-note">Снаряжения нет.</div>
      ) : (
        equipment.map((item) => (
          <div key={item.id} className="list-row">
            <div className="row-main">
              <div className="row-title">
                <span>{item.name}</span>
                <span className="row-inline">{STATE_LABELS[item.state]}</span>
              </div>
              {item.notes !== null && <div className="row-note">{item.notes}</div>}
            </div>
            <div className="row-side">
              {item.weightKg !== null && <span className="row-points">{item.weightKg} кг</span>}
              {item.price !== null && <span className="row-points">${item.price}</span>}
              {item.quantity !== 1 && <span className="row-points">×{item.quantity}</span>}
            </div>
          </div>
        ))
      )}
    </CollapsibleSection>
  );
}
