import type { CatalogKey, EntityId } from "../../common.js";

export interface HitLocation {
  readonly id: EntityId;
  readonly catalogKey: CatalogKey;
  readonly name: string;
  readonly description: string;
}
