export const catalogFeature = {
  key: "catalog",
  routes: {
    list: "/products",
    detail: (id: string | number) => `/products/${id}`,
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
