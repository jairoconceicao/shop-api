import { queryOptions, useQuery } from '@tanstack/react-query'

import { AppError } from '../../../shared/errors/appError'
import { parseProductId } from '../routing/productId'
import { fetchProductDetail } from '../services/productDetailService'

export const productQueryKeys = {
  all: ['catalog', 'products'] as const,
  detail: (productId: number) =>
    [...productQueryKeys.all, 'detail', productId] as const,
}

export function isProductNotFoundError(error: unknown): error is AppError {
  return (
    error instanceof AppError && error.kind === 'http' && error.status === 404
  )
}

export function productDetailQueryOptions(routeProductId: string | undefined) {
  const productId = parseProductId(routeProductId)

  return queryOptions({
    queryKey: productQueryKeys.detail(productId ?? 0),
    queryFn: ({ signal }) => fetchProductDetail(productId ?? 0, signal),
    enabled: productId !== undefined,
  })
}

export function useProductDetailQuery(routeProductId: string | undefined) {
  return useQuery(productDetailQueryOptions(routeProductId))
}
