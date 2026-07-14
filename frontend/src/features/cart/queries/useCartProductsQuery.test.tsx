import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ProductDetail } from '../../catalog/contracts/catalog'
import { productQueryKeys } from '../../catalog/queries/useProductDetailQuery'
import type { CartItem } from '../contracts/cart'
import {
  cartProductsQueryKeys,
  useCartProductsQuery,
} from './useCartProductsQuery'

const { fetchProductDetail } = vi.hoisted(() => ({ fetchProductDetail: vi.fn() }))

vi.mock('../../catalog/services/productDetailService', () => ({ fetchProductDetail }))

const item = (productId: number, id = productId): CartItem => ({
  id,
  productId,
  quantity: 1,
  unitPrice: 10,
})

const product = (id: number): ProductDetail => ({
  id,
  title: `Product ${id}`,
  description: null,
  model: null,
  photo: null,
  price: id,
  stock: 10,
  category: { id: 1, title: 'Category' },
})

function createHarness() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { queryClient, wrapper }
}

describe('useCartProductsQuery', () => {
  beforeEach(() => {
    fetchProductDetail.mockReset()
  })

  it('deduplicates and sorts product ids without mutating cart items', async () => {
    const items = [item(3), item(1), item(3, 30), item(2)]
    const originalOrder = items.map(({ productId }) => productId)
    fetchProductDetail.mockImplementation(async (id: number) => product(id))
    const { queryClient, wrapper } = createHarness()
    const { result } = renderHook(() => useCartProductsQuery(items), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.map(({ productId }) => productId)).toEqual([1, 2, 3])
    expect(items.map(({ productId }) => productId)).toEqual(originalOrder)
    expect(fetchProductDetail).toHaveBeenCalledTimes(3)
    expect(queryClient.getQueryCache().find({
      queryKey: cartProductsQueryKeys.list([1, 2, 3]),
    })?.meta).toEqual({ private: true })
  })

  it('hydrates unique products in parallel and isolates individual failures', async () => {
    let resolveFirst!: (value: ProductDetail) => void
    let resolveThird!: (value: ProductDetail) => void
    fetchProductDetail.mockImplementation((id: number) => {
      if (id === 1) return new Promise<ProductDetail>((resolve) => { resolveFirst = resolve })
      if (id === 2) return Promise.reject(new Error('Unavailable'))
      return new Promise<ProductDetail>((resolve) => { resolveThird = resolve })
    })
    const { wrapper } = createHarness()
    const { result } = renderHook(() => useCartProductsQuery([item(1), item(2), item(3)]), { wrapper })

    await waitFor(() => expect(fetchProductDetail).toHaveBeenCalledTimes(3))
    act(() => {
      resolveFirst(product(1))
      resolveThird(product(3))
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([
      { status: 'success', productId: 1, product: product(1) },
      { status: 'error', productId: 2, error: expect.any(Error) },
      { status: 'success', productId: 3, product: product(3) },
    ])
  })

  it('reuses the product detail cache and deduplicates concurrent detail requests', async () => {
    fetchProductDetail.mockImplementation(async (id: number) => product(id))
    const { queryClient, wrapper } = createHarness()
    queryClient.setQueryData(productQueryKeys.detail(1), product(1))

    const first = renderHook(() => useCartProductsQuery([item(1), item(2)]), { wrapper })
    const second = renderHook(() => useCartProductsQuery([item(2), item(1)]), { wrapper })

    await waitFor(() => expect(first.result.current.isSuccess).toBe(true))
    await waitFor(() => expect(second.result.current.isSuccess).toBe(true))
    expect(fetchProductDetail).toHaveBeenCalledTimes(1)
    expect(fetchProductDetail).toHaveBeenCalledWith(2, expect.any(AbortSignal))
  })

  it('represents an empty cart as successful without fetching or loading', () => {
    const { wrapper } = createHarness()
    const { result } = renderHook(() => useCartProductsQuery([]), { wrapper })

    expect(result.current.data).toEqual([])
    expect(result.current.isSuccess).toBe(true)
    expect(result.current.isFetching).toBe(false)
    expect(fetchProductDetail).not.toHaveBeenCalled()
  })

  it('refetches the current set and reacts when the product set changes', async () => {
    fetchProductDetail.mockImplementation(async (id: number) => product(id))
    const { wrapper } = createHarness()
    const { result, rerender } = renderHook(
      ({ items }) => useCartProductsQuery(items),
      { initialProps: { items: [item(2)] }, wrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    await act(() => result.current.refetch())
    await waitFor(() => expect(fetchProductDetail).toHaveBeenCalledTimes(2))

    rerender({ items: [item(3), item(2)] })
    await waitFor(() => expect(result.current.data?.map(({ productId }) => productId)).toEqual([2, 3]))
    expect(fetchProductDetail).toHaveBeenCalledWith(3, expect.any(AbortSignal))
  })
})
