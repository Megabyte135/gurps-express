import { Icon } from "../icons/Icon";
import type { ResourceTrackerDto } from "../../data/types";
import "./hero-trackers.css";

interface HeroTrackersProps {
  readonly trackers: readonly ResourceTrackerDto[];
  readonly current: Readonly<Record<string, number>>;
  readonly onAdjust: (technicalName: string, delta: number) => void;
  readonly onReset: (technicalName: string) => void;
}

export function HeroTrackers({ trackers, current, onAdjust, onReset }: HeroTrackersProps) {
  return (
    <div className="hero-trackers">
      {trackers.map((tracker) => {
        const value = current[tracker.technicalName] ?? tracker.max;
        const min = tracker.min ?? 0;
        const span = tracker.max - min;
        const fill = span <= 0 ? 0 : Math.max(0, Math.min(100, ((value - min) / span) * 100));
        return (
          <div key={tracker.technicalName} className={`tracker tracker-${tracker.theme}`}>
            <div className="tracker-head">
              <span className="tracker-name">{tracker.name}</span>
              <button
                type="button"
                className="icon-button tracker-reset"
                title="Восстановить максимум"
                aria-label={`${tracker.name}: восстановить максимум`}
                onClick={() => onReset(tracker.technicalName)}
              >
                <Icon name="reset" size={12} />
              </button>
            </div>
            <div className="tracker-value">
              <span className={`tracker-current${value < 0 ? " is-negative" : ""}`} key={value}>
                {value}
              </span>
              <span className="tracker-max">/ {tracker.max}</span>
            </div>
            <div className="tracker-bar">
              <i style={{ width: `${fill}%` }} />
            </div>
            <div className="tracker-controls">
              <button type="button" onClick={() => onAdjust(tracker.technicalName, -5)}>
                −5
              </button>
              <button type="button" onClick={() => onAdjust(tracker.technicalName, -1)}>
                −1
              </button>
              <button type="button" onClick={() => onAdjust(tracker.technicalName, 1)}>
                +1
              </button>
              <button type="button" onClick={() => onAdjust(tracker.technicalName, 5)}>
                +5
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
