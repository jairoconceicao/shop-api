import { queryOptions, useQuery } from '@tanstack/react-query'

import { privateCacheMeta } from '../../../shared/query/privateCache'
import { useAuthStore } from '../../auth/store/authStore'
import { getCart } from '../services/getCartService'
import { useCartSessionStore } from '../store/cartSessionStore'

export const cartQueryKeys = {
  all: ['cart'] as const,
  details: () => [...cartQueryKeys.all, 'detail'] as const,
  detail: (customerId: number | null, cartId: number | null) =>
    [...cartQueryKeys.details(), customerId, cartId] as const,
}

export function cartQueryOptions(
  customerId: number | undefined,
  cartId: number | undefined,
  token: string | undefined,
) {
  const hasValidToken = token !== undefined && token.trim().length > 0

  return queryOptions({
    queryKey: cartQueryKeys.detail(customerId ?? null, cartId ?? null),
    queryFn: ({ signal }) => {
      if (cartId === undefined || !hasValidToken) {
        throw new Error('Cart association is unavailable')
      }

      return getCart(cartId, token, signal)
    },
    enabled: customerId !== undefined && cartId !== undefined && hasValidToken,
    meta: privateCacheMeta,
  })
}

export function useCartQuery() {
  const session = useAuthStore((state) => state.session)
  const customerId = session?.clienteId
  const cartId = useCartSessionStore((state) =>
    customerId === undefined ? undefined : state.cartIdsByCustomer[String(customerId)],
  )
  const query = useQuery(cartQueryOptions(customerId, cartId, session?.token))

  return { ...query, hasCart: cartId !== undefined }
}
