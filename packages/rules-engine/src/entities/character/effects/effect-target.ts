import type { EntityId } from "../../common.js";

export type EffectTarget =
  | { readonly kind: "attribute"; readonly attributeId: EntityId }
  | { readonly kind: "skill"; readonly skillId: EntityId }
  | { readonly kind: "resource"; readonly resourceId: EntityId };
