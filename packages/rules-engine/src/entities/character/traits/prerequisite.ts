import type { CatalogKey, Decimal } from "../../common.js";

export type Prerequisite =
  | { readonly kind: "all"; readonly prerequisites: readonly Prerequisite[] }
  | { readonly kind: "any"; readonly prerequisites: readonly Prerequisite[] }
  | { readonly kind: "not"; readonly prerequisite: Prerequisite }
  | { readonly kind: "attribute"; readonly attribute: string; readonly minimum: Decimal }
  | { readonly kind: "feature"; readonly featureCatalogKey: CatalogKey; readonly minimumLevel?: Decimal }
  | { readonly kind: "tag"; readonly tag: string };
