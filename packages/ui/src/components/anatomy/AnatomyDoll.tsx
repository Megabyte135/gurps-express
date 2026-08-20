import { useMemo, useState } from "react";
import type { AnatomyDto, AnatomyZoneDto, HitLocationDto } from "../../data/types";
import { useDice } from "../../state/dice";
import { Icon } from "../icons/Icon";
import "./anatomy.css";

interface Point {
  readonly x: number;
  readonly y: number;
}

function centroid(points: readonly Point[]): Point {
  let sumX = 0;
  let sumY = 0;
  for (const point of points) {
    sumX += point.x;
    sumY += point.y;
  }
  return { x: sumX / points.length, y: sumY / points.length };
}

function polygonToPath(points: readonly Point[]): string {
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`).join(" ") + " Z";
}

function formatHitOn(hitOn: readonly number[]): string {
  if (hitOn.length === 0) return "прицельно";
  return hitOn.join(", ");
}

interface ZoneInfo {
  readonly zone: AnatomyZoneDto;
  readonly location: HitLocationDto;
}

export function AnatomyDoll({ anatomy }: { readonly anatomy: AnatomyDto }) {
  const dice = useDice();
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const locationById = useMemo(() => {
    const map = new Map<string, HitLocationDto>();
    for (const location of anatomy.hitLocations) map.set(location.id, location);
    return map;
  }, [anatomy.hitLocations]);

  const activeZoneId = hoveredZone ?? selectedZone;
  const active = useMemo<ZoneInfo | null>(() => {
    if (activeZoneId === null) return null;
    const zone = anatomy.zones.find((item) => item.id === activeZoneId);
    if (zone === undefined) return null;
    const location = locationById.get(zone.hitLocationId);
    if (location === undefined) return null;
    return { zone, location };
  }, [activeZoneId, anatomy.zones, locationById]);

  const highlightedZoneId = useMemo(() => {
    const current = dice.current;
    if (current === null || current.kind !== "expression" || current.purpose !== "hit-location") return null;
    if (dice.rolling) return null;
    const roll = Number(current.result.total);
    const location = anatomy.hitLocations.find((item) => item.hitOn.includes(roll));
    if (location === undefined) return null;
    return anatomy.zones.find((zone) => zone.hitLocationId === location.id)?.id ?? null;
  }, [dice.current, dice.rolling, anatomy]);

  const tooltip =
    active !== null
      ? {
          left: (centroid(active.zone.polygon).x / anatomy.canvas.width) * 100,
          top: (centroid(active.zone.polygon).y / anatomy.canvas.height) * 100,
          title: active.location.name,
          hitOn: formatHitOn(active.location.hitOn),
          description: active.location.description,
        }
      : null;

  return (
    <div className="anatomy-panel">
      <div className="anatomy-head">
        <span className="dice-block-title">Анатомия</span>
        <button
          type="button"
          className="btn anatomy-roll"
          onClick={dice.requestHitLocationRoll}
          title="Бросить 3d6 и определить зону попадания"
        >
          <Icon name="dice" size={13} />
          Локация
        </button>
      </div>

      <div className="doll-wrap">
        <svg
          className="doll"
          viewBox={`0 0 ${anatomy.canvas.width} ${anatomy.canvas.height}`}
          role="img"
          aria-label="Карта зон попадания"
        >
          <defs>
            <pattern id="doll-hatch" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 40L40 0" stroke="var(--accent)" strokeWidth="6" opacity="0.35" />
            </pattern>
          </defs>

          <g className="doll-silhouette" aria-hidden="true">
            <circle cx={anatomy.canvas.width / 2} cy={190} r={168} />
            <rect x={330} y={316} width={340} height={566} rx={130} />
            <path
              d={`M336 340 L212 344 L206 958 L326 958 L322 470 Z`}
            />
            <path
              d={`M664 340 L788 344 L794 958 L674 958 L678 470 Z`}
            />
            <rect x={338} y={878} width={144} height={962} rx={60} />
            <rect x={518} y={878} width={144} height={962} rx={60} />
          </g>

          {anatomy.zones.map((zone) => {
            const location = locationById.get(zone.hitLocationId);
            const isActive = zone.id === activeZoneId;
            const isHighlighted = zone.id === highlightedZoneId;
            const isSelectable = location !== undefined;
            return (
              <g key={zone.id} className="doll-zone-g">
                <path
                  className={`doll-zone${isActive ? " is-active" : ""}${isHighlighted ? " is-hit" : ""}`}
                  d={polygonToPath(zone.polygon)}
                  fill={isHighlighted && isActive ? "url(#doll-hatch)" : undefined}
                />
                {isSelectable && (
                  <path
                    className="doll-zone-hit"
                    d={polygonToPath(zone.polygon)}
                    tabIndex={0}
                    role="button"
                    aria-label={`${location.name}: ${formatHitOn(location.hitOn)}`}
                    onMouseEnter={() => setHoveredZone(zone.id)}
                    onMouseLeave={() => setHoveredZone(null)}
                    onClick={() => setSelectedZone(selectedZone === zone.id ? null : zone.id)}
                    onFocus={() => setHoveredZone(zone.id)}
                    onBlur={() => setHoveredZone(null)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedZone(selectedZone === zone.id ? null : zone.id);
                      }
                    }}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {tooltip !== null && (
          <div
            className="doll-tip"
            style={
              {
                "--tip-left": `${tooltip.left}%`,
                "--tip-top": `${tooltip.top}%`,
              } as React.CSSProperties
            }
          >
            <span className="doll-tip-title">{tooltip.title}</span>
            <span className="doll-tip-hit">{tooltip.hitOn}</span>
            {tooltip.description !== null && (
              <span className="doll-tip-desc">{tooltip.description}</span>
            )}
          </div>
        )}
      </div>

      {active !== null && (
        <div className="anatomy-details" key={active.zone.id}>
          <span className="anatomy-details-name">{active.location.name}</span>
          <span className="anatomy-details-hit">3d6: {formatHitOn(active.location.hitOn)}</span>
          {active.location.originalName !== null && (
            <span className="anatomy-details-original">{active.location.originalName}</span>
          )}
          {active.location.description !== null && (
            <p className="anatomy-details-desc">{active.location.description}</p>
          )}
        </div>
      )}
    </div>
  );
}
