import { queryOptions, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'

import type { ProductDetail } from '../../catalog/contracts/catalog'
import { productDetailQueryOptions } from '../../catalog/queries/useProductDetailQuery'
import type { OrderItem } from '../contracts/orders'

export type OrderProductResult =
  | { status: 'success'; productId: number; product: ProductDetail }
  | { status: 'error'; productId: number; error: unknown }

export function orderProductsQueryOptions(
  productIds: readonly number[],
  queryClient: QueryClient,
) {
  const uniqueProductIds = [...new Set(productIds)].sort((a, b) => a - b)

  return queryOptions({
    queryKey: ['orders', 'products', uniqueProductIds] as const,
    queryFn: () => Promise.all(uniqueProductIds.map(async (productId): Promise<OrderProductResult> => {
      try {
        const product = await queryClient.ensureQueryData(
          productDetailQueryOptions(String(productId)),
        )
        return { status: 'success', productId, product }
      } catch (error) {
        return { status: 'error', productId, error }
      }
    })),
    enabled: uniqueProductIds.length > 0,
  })
}

export function useOrderProductsQuery(items: readonly OrderItem[]) {
  const queryClient = useQueryClient()
  return useQuery(orderProductsQueryOptions(
    items.map((item) => item.productId),
    queryClient,
  ))
}
