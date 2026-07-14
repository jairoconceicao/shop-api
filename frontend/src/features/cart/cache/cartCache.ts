import type { QueryClient } from '@tanstack/react-query'

import { privateCacheMeta } from '../../../shared/query/privateCache'
import { useCartSessionStore } from '../store/cartSessionStore'
import type { Cart } from '../contracts/cart'

const query = {
  all: ['cart'] as const,
  details: () => [...query.all, 'detail'] as const,
  detail: (customerId: number | null, cartId: number | null) =>
    [...query.details(), customerId, cartId] as const,
}

const mutation = {
  create: (customerId: number) => ['cart', 'create', customerId] as const,
  add: (customerId: number, cartId: number) => ['cart', 'item', 'add', customerId, cartId] as const,
  update: (customerId: number, cartId: number, itemId: number) =>
    ['cart', 'item', 'update', customerId, cartId, itemId] as const,
  delete: (customerId: number, cartId: number) => ['cart', 'item', 'delete', customerId, cartId] as const,
}

export const cartCache = { query, mutation, meta: privateCacheMeta }

export function updateExistingCart(
  queryClient: QueryClient,
  customerId: number,
  cartId: number,
  update: (cart: Cart) => Cart,
): void {
  const cachedQuery = queryClient.getQueryCache().find({
    queryKey: cartCache.query.detail(customerId, cartId),
    exact: true,
  })
  if (!cachedQuery || useCartSessionStore.getState().getCartId(customerId) !== cartId) return

  const state = cachedQuery.state
  cachedQuery.setState({
    ...state,
    data: state.data ? update(state.data as Cart) : state.data,
  })
}

export async function reconcileActiveCart(
  queryClient: QueryClient,
  customerId: number,
  cartId: number,
): Promise<boolean> {
  if (useCartSessionStore.getState().getCartId(customerId) !== cartId) return false

  const queryKey = cartCache.query.detail(customerId, cartId)
  const cachedQuery = queryClient.getQueryCache().find({ queryKey, exact: true })
  if (!cachedQuery?.isActive()) return false

  try {
    await queryClient.refetchQueries(
      { queryKey, exact: true, type: 'active' },
      { throwOnError: true },
    )
    return true
  } catch {
    // The HTTP mutation already succeeded; background reconciliation is best-effort.
    return false
  }
}
