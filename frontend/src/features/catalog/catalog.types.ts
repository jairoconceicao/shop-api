import { z } from "zod";

export const catalogSortSchema = z.enum(["relevance", "price-asc", "price-desc", "stock-desc"]);
export const catalogStockFilterSchema = z.enum(["all", "in-stock", "low-stock", "out-of-stock"]);

export type CatalogSort = z.infer<typeof catalogSortSchema>;
export type CatalogStockFilter = z.infer<typeof catalogStockFilterSchema>;

export type CatalogProductSummary = {
  id: number;
  title: string;
  imageUrl: string | null;
  price: number;
  stock: number;
};

export type CatalogProductDetail = CatalogProductSummary & {
  description: string;
  model: string | null;
};

export type CatalogPageData = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
  items: CatalogProductSummary[];
};

