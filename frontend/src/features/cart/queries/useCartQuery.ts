import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { AppError } from '../../../shared/errors/appError'
import { useAuthStore } from '../../auth/store/authStore'
import { cartCache } from '../cache/cartCache'
import { getCart } from '../services/getCartService'
import { useCartSessionStore } from '../store/cartSessionStore'

export const cartQueryKeys = cartCache.query

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
    meta: cartCache.meta,
  })
}

export function useCartQuery() {
  const queryClient = useQueryClient()
  const session = useAuthStore((state) => state.session)
  const customerId = session?.clienteId
  const cartId = useCartSessionStore((state) =>
    customerId === undefined ? undefined : state.cartIdsByCustomer[String(customerId)],
  )
  const query = useQuery(cartQueryOptions(customerId, cartId, session?.token))

  useEffect(() => {
    if (
      customerId === undefined
      || cartId === undefined
      || !(query.error instanceof AppError)
      || query.error.kind !== 'http'
      || query.error.status !== 404
    ) {
      return
    }

    const currentCartId = useCartSessionStore.getState().cartIdsByCustomer[String(customerId)]

    if (currentCartId !== cartId) {
      return
    }

    useCartSessionStore.getState().removeCartId(customerId)
    queryClient.removeQueries({ queryKey: cartQueryKeys.detail(customerId, cartId), exact: true })
  }, [cartId, customerId, query.error, queryClient])

  return { ...query, hasCart: cartId !== undefined }
}
