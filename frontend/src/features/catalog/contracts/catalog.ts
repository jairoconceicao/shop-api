import { z } from 'zod'

import {
  normalizeId,
  normalizeNumber,
} from '../../../shared/adapters/numbers'
import {
  createApiResponseSchema,
  createPagedResponseSchema,
} from '../../../shared/contracts/apiEnvelopes'

const transportIdSchema = z.union([
  z.number().int().safe(),
  z.string().regex(/^-?(?:0|[1-9]\d*)$/),
])

const transportNumberSchema = z.union([
  z.number().finite(),
  z.string().regex(/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/),
])

export const productCategorySchema = z.object({
  categoriaId: transportIdSchema,
  titulo: z.string().min(1),
}).strict()

export const categorySchema = productCategorySchema.extend({
  descricao: z.string().nullable(),
}).strict()

export const catalogProductSchema = z.object({
  produtoId: transportIdSchema,
  titulo: z.string().min(1),
  thumb: z.string().nullable(),
  preco: transportNumberSchema,
  estoque: transportNumberSchema,
  categoria: productCategorySchema,
}).strict()

export const productDetailSchema = z.object({
  produtoId: transportIdSchema,
  titulo: z.string().min(1),
  descricao: z.string().nullable(),
  modelo: z.string().nullable(),
  foto: z.string().nullable(),
  preco: transportNumberSchema,
  estoque: transportNumberSchema,
  categoria: productCategorySchema,
}).strict()

export const categoriesResponseSchema = createApiResponseSchema(
  z.array(categorySchema),
)

export const catalogResponseSchema = createPagedResponseSchema(
  catalogProductSchema,
)

export const productDetailResponseSchema = createApiResponseSchema(
  productDetailSchema,
)

export type ProductCategory = {
  id: number
  title: string
}

export type Category = ProductCategory & {
  description: string | null
}

export type CatalogProduct = {
  id: number
  title: string
  thumbnail: string | null
  price: number
  stock: number
  category: ProductCategory
}

export type CatalogPage = {
  products: CatalogProduct[]
  pagination: {
    pages: number
    size: number
    totalItems: number
  }
}

export type ProductDetail = {
  id: number
  title: string
  description: string | null
  model: string | null
  photo: string | null
  price: number
  stock: number
  category: ProductCategory
}

function adaptProductCategory(
  category: z.infer<typeof productCategorySchema>,
): ProductCategory {
  return {
    id: normalizeId(category.categoriaId),
    title: category.titulo,
  }
}

export function adaptCategoriesResponse(response: unknown): Category[] {
  const parsedResponse = categoriesResponseSchema.parse(response)

  if (parsedResponse.status === false || !parsedResponse.data) {
    throw new TypeError('Category response does not contain successful data')
  }

  return parsedResponse.data.map((category) => ({
    ...adaptProductCategory(category),
    description: category.descricao,
  }))
}

export function adaptCatalogResponse(response: unknown): CatalogPage {
  const parsedResponse = catalogResponseSchema.parse(response)
  const pagination = parsedResponse.pagination

  if (
    parsedResponse.status === false ||
    !pagination ||
    pagination.pages === undefined ||
    pagination.size === undefined ||
    pagination.totalItems === undefined ||
    !pagination.data
  ) {
    throw new TypeError(
      'Catalog response does not contain successful pagination data',
    )
  }

  return {
    products: pagination.data.map((product) => ({
      id: normalizeId(product.produtoId),
      title: product.titulo,
      thumbnail: product.thumb,
      price: normalizeNumber(product.preco),
      stock: normalizeNumber(product.estoque),
      category: adaptProductCategory(product.categoria),
    })),
    pagination: {
      pages: normalizeId(pagination.pages),
      size: normalizeId(pagination.size),
      totalItems: normalizeId(pagination.totalItems),
    },
  }
}

export function adaptProductDetailResponse(response: unknown): ProductDetail {
  const parsedResponse = productDetailResponseSchema.parse(response)

  if (parsedResponse.status === false || !parsedResponse.data) {
    throw new TypeError(
      'Product detail response does not contain successful data',
    )
  }

  const product = parsedResponse.data

  return {
    id: normalizeId(product.produtoId),
    title: product.titulo,
    description: product.descricao,
    model: product.modelo,
    photo: product.foto,
    price: normalizeNumber(product.preco),
    stock: normalizeNumber(product.estoque),
    category: adaptProductCategory(product.categoria),
  }
}
