import type { CharacterSheetDto } from "../../data/types";
import { DicePanel } from "../dice/DicePanel";
import { AnatomyDoll } from "../anatomy/AnatomyDoll";
import "./shell.css";
import "./sidebar.css";

interface SidebarProps {
  readonly sheet: CharacterSheetDto | null;
  readonly trackerCurrent: Readonly<Record<string, number>>;
  readonly onAdjustTracker: (technicalName: string, delta: number) => void;
}

function MiniTrackers({
  trackers,
  current,
  onAdjust,
}: {
  readonly trackers: CharacterSheetDto["trackers"];
  readonly current: Readonly<Record<string, number>>;
  readonly onAdjust: (technicalName: string, delta: number) => void;
}) {
  return (
    <div className="mini-trackers">
      {trackers.map((tracker) => {
        const value = current[tracker.technicalName] ?? tracker.max;
        const min = tracker.min ?? 0;
        const span = tracker.max - min;
        const fill = span <= 0 ? 0 : Math.max(0, Math.min(100, ((value - min) / span) * 100));
        return (
          <div className={`mini-tracker mini-${tracker.theme}`} key={tracker.technicalName}>
            <div className="mini-row">
              <span className="mini-name">{tracker.name}</span>
              <span className={`mini-value${value < 0 ? " is-negative" : ""}`}>
                {value}
                <small>/{tracker.max}</small>
              </span>
              <button
                type="button"
                className="mini-adjust"
                aria-label={`${tracker.name}: −1`}
                onClick={() => onAdjust(tracker.technicalName, -1)}
              >
                −
              </button>
              <button
                type="button"
                className="mini-adjust"
                aria-label={`${tracker.name}: +1`}
                onClick={() => onAdjust(tracker.technicalName, 1)}
              >
                +
              </button>
            </div>
            <div className="mini-bar">
              <i style={{ width: `${fill}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Sidebar({ sheet, trackerCurrent, onAdjustTracker }: SidebarProps) {
  return (
    <div className="sidebar">
      {sheet !== null && (
        <MiniTrackers trackers={sheet.trackers} current={trackerCurrent} onAdjust={onAdjustTracker} />
      )}
      <DicePanel />
      {sheet?.anatomy != null && <AnatomyDoll anatomy={sheet.anatomy} />}
    </div>
  );
}
