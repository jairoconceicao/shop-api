export const catalogFeature = {
  key: "catalog",
  routes: {
    list: "/catalogo",
    detail: (id: string | number) => `/produto/${id}`,
  },
} as const;

export { getCatalogPage, getProductById } from "./catalog.api";
export type {
  CatalogPageData,
  CatalogProductDetail,
  CatalogProductSummary,
  CatalogSort,
  CatalogStockFilter,
} from "./catalog.types";

