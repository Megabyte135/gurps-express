import type { CatalogKey, EntityId, Result } from "../../common.js";

/** A point on the body map canvas in canvas coordinates. */
export interface BodyMapPoint {
  readonly x: number;
  readonly y: number;
}

/** Canvas geometry the zone polygons are expressed against. */
export interface BodyMapCanvas {
  readonly width: number;
  readonly height: number;
  /**
   * Optional picture layered under the zones (a custom doll illustration).
   * The engine only stores the reference; persistence is up to the API.
   */
  readonly imageUrl: string | null;
}

export interface BodyMapZoneInput {
  readonly id: EntityId;
  /** The hit location this zone belongs to; several zones may share one location. */
  readonly hitLocationId: EntityId;
  readonly label: string | null;
  readonly polygon: readonly BodyMapPoint[];
  readonly subzones: readonly BodyMapZoneInput[];
}

export interface BodyMapInput {
  readonly id: EntityId;
  readonly catalogKey: CatalogKey;
  readonly name: string;
  readonly description: string;
  readonly canvas: BodyMapCanvas;
  readonly zones: readonly BodyMapZoneInput[];
}

/** A frozen zone tree; polygons and identity are immutable after construction. */
export interface BodyMapZone {
  readonly id: EntityId;
  readonly hitLocationId: EntityId;
  readonly label: string | null;
  readonly polygon: readonly BodyMapPoint[];
  readonly subzones: readonly BodyMapZone[];
}

export interface PolygonTooFewPointsError {
  readonly code: "polygon-too-few-points";
  readonly message: string;
  readonly zoneId: EntityId;
  readonly pointCount: number;
}

export interface PolygonOutOfBoundsError {
  readonly code: "polygon-out-of-bounds";
  readonly message: string;
  readonly zoneId: EntityId;
  readonly points: readonly BodyMapPoint[];
}

export interface DuplicateZoneIdError {
  readonly code: "duplicate-zone-id";
  readonly message: string;
  readonly zoneIds: readonly EntityId[];
}

export type BodyMapError =
  | PolygonTooFewPointsError
  | PolygonOutOfBoundsError
  | DuplicateZoneIdError;

/**
 * A picture of a body divided into zones, each tied to a hit location of an
 * anatomy. Zone polygons live on the normalized `canvas` grid so the same map
 * renders at any scale and can be re-skinned by the presentation layer.
 */
export class BodyMap {
  readonly id: EntityId;
  readonly catalogKey: CatalogKey;
  readonly name: string;
  readonly description: string;
  readonly canvas: BodyMapCanvas;
  readonly zones: readonly BodyMapZone[];

  private constructor(input: BodyMapInput, zones: readonly BodyMapZone[]) {
    this.id = input.id;
    this.catalogKey = input.catalogKey;
    this.name = input.name;
    this.description = input.description;
    this.canvas = input.canvas;
    this.zones = zones;
  }

  public static create(input: BodyMapInput): Result<BodyMap, BodyMapError> {
    const seenIds = new Set<EntityId>();
    const duplicates: EntityId[] = [];

    const validateZone = (zone: BodyMapZoneInput): Result<BodyMapZone, BodyMapError> => {
      if (seenIds.has(zone.id)) duplicates.push(zone.id);
      seenIds.add(zone.id);

      if (zone.polygon.length < 3) {
        return {
          ok: false,
          error: {
            code: "polygon-too-few-points",
            message: `Zone "${zone.id}" polygon must have at least 3 points; received ${zone.polygon.length}.`,
            zoneId: zone.id,
            pointCount: zone.polygon.length,
          },
        };
      }

      const outOfBounds = zone.polygon.filter(
        (point) =>
          !Number.isFinite(point.x) ||
          !Number.isFinite(point.y) ||
          point.x < 0 ||
          point.x > input.canvas.width ||
          point.y < 0 ||
          point.y > input.canvas.height,
      );
      if (outOfBounds.length > 0) {
        return {
          ok: false,
          error: {
            code: "polygon-out-of-bounds",
            message: `Zone "${zone.id}" polygon points must stay within the ${input.canvas.width}x${input.canvas.height} canvas.`,
            zoneId: zone.id,
            points: outOfBounds,
          },
        };
      }

      const subzones: BodyMapZone[] = [];
      for (const subzone of zone.subzones) {
        const validation = validateZone(subzone);
        if (!validation.ok) return validation;
        subzones.push(validation.value);
      }

      return {
        ok: true,
        value: {
          id: zone.id,
          hitLocationId: zone.hitLocationId,
          label: zone.label,
          polygon: zone.polygon.map((point) => ({ ...point })),
          subzones,
        },
      };
    };

    const zones: BodyMapZone[] = [];
    for (const zone of input.zones) {
      const validation = validateZone(zone);
      if (!validation.ok) return validation;
      zones.push(validation.value);
    }

    if (duplicates.length > 0) {
      return {
        ok: false,
        error: {
          code: "duplicate-zone-id",
          message: `Body map zone ids must be unique; duplicates: ${[...new Set(duplicates)].join(", ")}.`,
          zoneIds: [...new Set(duplicates)],
        },
      };
    }

    return { ok: true, value: new BodyMap(input, zones) };
  }
}
