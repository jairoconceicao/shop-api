import { QueryClient, QueryObserver } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'

import { useCartSessionStore } from '../store/cartSessionStore'
import { cartCache, reconcileActiveCart } from './cartCache'

describe('cartCache', () => {
  it('centralizes private query and mutation identities', () => {
    expect(cartCache.query.detail(10, 100)).toEqual(['cart', 'detail', 10, 100])
    expect(cartCache.mutation.update(10, 100, 7)).toEqual(['cart', 'item', 'update', 10, 100, 7])
    expect(cartCache.meta).toEqual({ private: true })
  })

  it('refetches only the exact active cart and swallows a background failure', async () => {
    useCartSessionStore.setState({ cartIdsByCustomer: { '10': 100, '20': 200 } })
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const target = vi.fn().mockRejectedValue(new Error('background'))
    const other = vi.fn().mockResolvedValue('other')
    const observer = new QueryObserver(client, {
      queryKey: cartCache.query.detail(10, 100), queryFn: target,
      enabled: false,
    })
    const unsubscribe = observer.subscribe(() => undefined)
    observer.setOptions({ queryKey: cartCache.query.detail(10, 100), queryFn: target })
    client.getQueryCache().build(client, {
      queryKey: cartCache.query.detail(20, 200), queryFn: other,
    })

    await expect(reconcileActiveCart(client, 10, 100)).resolves.toBe(false)
    expect(target).toHaveBeenCalledOnce()
    expect(other).not.toHaveBeenCalled()
    unsubscribe()
  })

  it('does not recreate cache after logout or refetch an inactive cart', async () => {
    useCartSessionStore.setState({ cartIdsByCustomer: { '10': 100 } })
    const client = new QueryClient()
    const fetcher = vi.fn()
    client.getQueryCache().build(client, {
      queryKey: cartCache.query.detail(10, 100), queryFn: fetcher,
    })

    await expect(reconcileActiveCart(client, 10, 100)).resolves.toBe(false)
    useCartSessionStore.getState().removeCartId(10)
    client.removeQueries({ queryKey: cartCache.query.detail(10, 100), exact: true })
    await expect(reconcileActiveCart(client, 10, 100)).resolves.toBe(false)

    expect(fetcher).not.toHaveBeenCalled()
    expect(client.getQueryCache().find({ queryKey: cartCache.query.detail(10, 100) })).toBeUndefined()
  })
})
