import { z } from "zod";
import { requestJson } from "@/shared/api/http";
import type {
  CatalogPageData,
  CatalogProductDetail,
  CatalogProductSummary,
} from "@/features/catalog/catalog.types";

const productSummarySchema = z.object({
  produtoId: z.number().int(),
  titulo: z.string().min(1),
  thumb: z.string().nullable().optional(),
  preco: z.number(),
  estoque: z.number(),
});

const productDetailSchema = z.object({
  produtoId: z.number().int(),
  titulo: z.string().min(1),
  descricao: z.string().min(1),
  modelo: z.string().nullable().optional(),
  foto: z.string().nullable().optional(),
  preco: z.number(),
  estoque: z.number(),
});

const pagedCatalogResponseSchema = z
  .object({
    status: z.boolean(),
    message: z.string(),
    pagination: z
      .object({
        pages: z.number().int().nonnegative(),
        size: z.number().int().positive(),
        totalItems: z.number().int().nonnegative().optional(),
        data: z.array(productSummarySchema).optional(),
        results: z.array(productSummarySchema).optional(),
        count: z.number().int().nonnegative().optional(),
        currentPage: z.number().int().positive().optional(),
        next: z.boolean().optional(),
        previous: z.boolean().optional(),
      })
      .passthrough(),
  })
  .transform(({ pagination }) => {
    const items = pagination.data ?? pagination.results ?? [];
    const totalItems = pagination.totalItems ?? pagination.count ?? items.length;

    return {
      currentPage: pagination.currentPage ?? 1,
      totalPages: pagination.pages,
      pageSize: pagination.size,
      totalItems,
      hasNext: pagination.next ?? false,
      hasPrevious: pagination.previous ?? (pagination.currentPage ?? 1) > 1,
      items: items.map(mapSummary),
    } satisfies CatalogPageData;
  });

const productDetailResponseSchema = z
  .object({
    status: z.boolean(),
    message: z.string(),
    data: productDetailSchema,
  })
  .transform(({ data }) => mapDetail(data));

function mapSummary(product: z.infer<typeof productSummarySchema>): CatalogProductSummary {
  return {
    id: product.produtoId,
    title: product.titulo,
    imageUrl: product.thumb ?? null,
    price: product.preco,
    stock: product.estoque,
  };
}

function mapDetail(product: z.infer<typeof productDetailSchema>): CatalogProductDetail {
  return {
    id: product.produtoId,
    title: product.titulo,
    imageUrl: product.foto ?? null,
    price: product.preco,
    stock: product.estoque,
    description: product.descricao,
    model: product.modelo ?? null,
  };
}

export async function getCatalogPage(page: number, size: number): Promise<CatalogPageData> {
  return pagedCatalogResponseSchema.parse(
    await requestJson<unknown>(`/produto?page=${page}&size=${size}`),
  );
}

export async function getProductById(id: string | number): Promise<CatalogProductDetail> {
  return productDetailResponseSchema.parse(await requestJson<unknown>(`/produto/${id}`));
}

