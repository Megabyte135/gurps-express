import type { CatalogKey, Decimal, EntityId, JsonSchema, JsonValue } from "../../common.js";
import type { Armor } from "./armor.js";
import type { Weapon } from "./weapon.js";

/** An equipment entity has the same shape in a catalog and on a character. */
export interface Equipment {
  readonly id: EntityId;
  readonly catalogKey: CatalogKey;
  readonly kind: "equipment";
  readonly name: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly weight: Decimal;
  readonly price: Decimal;
  readonly imageUrl: string | null;
  readonly configurationSchema: JsonSchema;
  readonly configuration: Readonly<Record<string, JsonValue>>;
  readonly isContainer: boolean;
  readonly capacity: Decimal | null;
  readonly isUnique: boolean;
  readonly weaponModes: readonly Weapon[];
  readonly armor: Armor | null;
  readonly quantity: Decimal;
  readonly wearState: "worn" | "removed" | "stored";
  readonly containerItemId: EntityId | null;
  readonly notes: string;
}
