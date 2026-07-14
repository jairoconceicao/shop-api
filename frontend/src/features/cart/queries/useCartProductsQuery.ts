import {
  type QueryClient,
  queryOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useMemo } from 'react'

import { privateCacheMeta } from '../../../shared/query/privateCache'
import type { ProductDetail } from '../../catalog/contracts/catalog'
import { productDetailQueryOptions } from '../../catalog/queries/useProductDetailQuery'
import type { CartItem } from '../contracts/cart'

export type CartProductResult =
  | { status: 'success'; productId: number; product: ProductDetail }
  | { status: 'error'; productId: number; error: unknown }

export const cartProductsQueryKeys = {
  all: ['cart', 'products'] as const,
  list: (productIds: readonly number[]) =>
    [...cartProductsQueryKeys.all, ...productIds] as const,
}

function uniqueSortedProductIds(items: readonly CartItem[]) {
  return [...new Set(items.map(({ productId }) => productId))].sort(
    (left, right) => left - right,
  )
}

export function cartProductsQueryOptions(
  productIds: readonly number[],
  queryClient: QueryClient,
) {
  return queryOptions({
    queryKey: cartProductsQueryKeys.list(productIds),
    queryFn: () => Promise.all(
      productIds.map(async (productId): Promise<CartProductResult> => {
        try {
          const product = await queryClient.ensureQueryData(
            productDetailQueryOptions(String(productId)),
          )
          return { status: 'success', productId, product }
        } catch (error) {
          return { status: 'error', productId, error }
        }
      }),
    ),
    enabled: productIds.length > 0,
    initialData: productIds.length === 0 ? [] : undefined,
    meta: privateCacheMeta,
  })
}

export function useCartProductsQuery(items: readonly CartItem[]) {
  const queryClient = useQueryClient()
  const productIds = useMemo(() => uniqueSortedProductIds(items), [items])

  return useQuery(cartProductsQueryOptions(productIds, queryClient))
}
