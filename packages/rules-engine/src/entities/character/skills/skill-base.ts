import type { EntityId } from "../../common.js";

export type SkillBase =
  | { readonly kind: "attribute"; readonly attributeId: EntityId }
  | { readonly kind: "skill"; readonly skillId: EntityId };
