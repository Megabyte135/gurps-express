import type { EntityId } from "../common.js";

export type ChangeSourceKind = "trait" | "condition" | "resource" | "improvement" | "manual";

export interface ChangeSource {
  readonly kind: ChangeSourceKind;
  readonly id: EntityId | null;
  readonly description: string;
}
