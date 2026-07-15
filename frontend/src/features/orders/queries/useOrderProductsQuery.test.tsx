import { QueryClient } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { orderProductsQueryOptions } from './useOrderProductsQuery'

const { productDetailQueryOptions } = vi.hoisted(() => ({
  productDetailQueryOptions: vi.fn(),
}))

vi.mock('../../catalog/queries/useProductDetailQuery', () => ({
  productDetailQueryOptions,
}))

describe('orderProductsQueryOptions', () => {
  beforeEach(() => productDetailQueryOptions.mockReset())

  it('deduplicates product ids and starts unique lookups in parallel', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const requestedIds: number[] = []
    const resolvers = new Map<number, (value: { id: number; title: string }) => void>()

    productDetailQueryOptions.mockImplementation((routeId: string) => {
      const productId = Number(routeId)
      return {
        queryKey: ['product', productId],
        queryFn: () => new Promise((resolve) => {
          requestedIds.push(productId)
          resolvers.set(productId, resolve)
        }),
      }
    })

    const promise = queryClient.fetchQuery(
      orderProductsQueryOptions([3, 3, 2], queryClient),
    )

    expect([...requestedIds].sort()).toEqual([2, 3])
    resolvers.get(2)?.({ id: 2, title: 'Mouse' })
    resolvers.get(3)?.({ id: 3, title: 'Teclado' })
    await expect(promise).resolves.toHaveLength(2)
  })

  it('isolates a failed product without hiding successful siblings', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    productDetailQueryOptions.mockImplementation((routeId: string) => ({
      queryKey: ['product', Number(routeId)],
      queryFn: () => routeId === '3'
        ? Promise.reject(new Error('gone'))
        : Promise.resolve({ id: 2, title: 'Mouse' }),
    }))

    await expect(queryClient.fetchQuery(
      orderProductsQueryOptions([2, 3], queryClient),
    )).resolves.toMatchObject([
      { status: 'success', productId: 2, product: { title: 'Mouse' } },
      { status: 'error', productId: 3, error: expect.any(Error) },
    ])
  })
})
