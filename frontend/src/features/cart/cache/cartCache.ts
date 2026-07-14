import type { QueryClient } from '@tanstack/react-query'

import { privateCacheMeta } from '../../../shared/query/privateCache'
import { useCartSessionStore } from '../store/cartSessionStore'

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

export async function reconcileActiveCart(
  queryClient: QueryClient,
  customerId: number,
  cartId: number,
): Promise<void> {
  if (useCartSessionStore.getState().getCartId(customerId) !== cartId) return

  const queryKey = cartCache.query.detail(customerId, cartId)
  const cachedQuery = queryClient.getQueryCache().find({ queryKey, exact: true })
  if (!cachedQuery?.isActive()) return

  try {
    await queryClient.refetchQueries({ queryKey, exact: true, type: 'active' })
  } catch {
    // The HTTP mutation already succeeded; background reconciliation is best-effort.
  }
}
