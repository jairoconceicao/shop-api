import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ProductDetail } from '../../catalog/contracts/catalog'
import { productQueryKeys } from '../../catalog/queries/useProductDetailQuery'
import { AppError } from '../../../shared/errors/appError'
import { useAddCartItemMutation } from './useAddCartItemMutation'

const { addCartItem, fetchProductDetail } = vi.hoisted(() => ({
  addCartItem: vi.fn(),
  fetchProductDetail: vi.fn(),
}))

vi.mock('../services/addCartItemService', () => ({ addCartItem }))
vi.mock('../../catalog/services/productDetailService', () => ({ fetchProductDetail }))

const product: ProductDetail = {
  id: 42, title: 'Produto', description: null, model: null, photo: null,
  price: 349.9, stock: 5, category: { id: 1, title: 'Categoria' },
}

function createHarness() {
  const queryClient = new QueryClient()
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { queryClient, wrapper }
}

describe('useAddCartItemMutation', () => {
  beforeEach(() => {
    addCartItem.mockReset().mockResolvedValue({ itemId: 7 })
    fetchProductDetail.mockReset().mockResolvedValue(product)
  })

  it('revalidates immediately before adding and uses only the revalidated id and price', async () => {
    const { queryClient, wrapper } = createHarness()
    queryClient.setQueryData(productQueryKeys.detail(42), { ...product, price: 300 })
    const order: string[] = []
    fetchProductDetail.mockImplementation(async () => { order.push('detail'); return product })
    addCartItem.mockImplementation(async () => { order.push('add'); return { itemId: 7 } })
    const { result } = renderHook(() => useAddCartItemMutation(), { wrapper })

    await act(() => result.current.mutateAsync({
      token: 'token', productId: 42, quantity: 2, displayedUnitPrice: 349.9,
    }))

    expect(order).toEqual(['detail', 'add'])
    expect(fetchProductDetail).toHaveBeenCalledWith(42, expect.any(AbortSignal))
    expect(addCartItem).toHaveBeenCalledOnce()
    expect(addCartItem).toHaveBeenCalledWith('token', {
      produtoId: 42, quantidade: 2, valorUnitario: 349.9,
    })
    expect(queryClient.getQueryData(productQueryKeys.detail(42))).toEqual(product)
  })

  it('updates detail cache but requires a new click when the price changed', async () => {
    const changed = { ...product, id: 43, price: 399.9 }
    fetchProductDetail.mockResolvedValue(changed)
    const { queryClient, wrapper } = createHarness()
    const { result } = renderHook(() => useAddCartItemMutation(), { wrapper })

    await expect(act(() => result.current.mutateAsync({
      token: 'token', productId: 42, quantity: 2, displayedUnitPrice: 349.9,
    }))).rejects.toMatchObject({
      kind: 'http', status: 409, code: 'PRODUCT_PRICE_CHANGED',
    } satisfies Partial<AppError>)

    expect(queryClient.getQueryData(productQueryKeys.detail(42))).toEqual(changed)
    expect(addCartItem).not.toHaveBeenCalled()
  })

  it('does not add when revalidation fails', async () => {
    const error = new AppError({ kind: 'network', message: 'Sem conexão.' })
    fetchProductDetail.mockRejectedValue(error)
    const { wrapper } = createHarness()
    const { result } = renderHook(() => useAddCartItemMutation(), { wrapper })

    await expect(act(() => result.current.mutateAsync({
      token: 'token', productId: 42, quantity: 1, displayedUnitPrice: 349.9,
    }))).rejects.toBe(error)
    expect(addCartItem).not.toHaveBeenCalled()
  })

  it('preserves backend price conflicts as the final authority', async () => {
    const conflict = new AppError({
      kind: 'http', status: 409, code: 'PRICE_CONFLICT', message: 'Preço alterado no servidor.',
    })
    addCartItem.mockRejectedValue(conflict)
    const { wrapper } = createHarness()
    const { result } = renderHook(() => useAddCartItemMutation(), { wrapper })

    await expect(act(() => result.current.mutateAsync({
      token: 'token', productId: 42, quantity: 1, displayedUnitPrice: 349.9,
    }))).rejects.toBe(conflict)
    expect(addCartItem).toHaveBeenCalledOnce()
  })

  it('does not retry a failed inclusion', async () => {
    addCartItem.mockRejectedValue(new AppError({ kind: 'network', message: 'Sem conexão.' }))
    const { wrapper } = createHarness()
    const { result } = renderHook(() => useAddCartItemMutation(), { wrapper })

    act(() => result.current.mutate({
      token: 'token', productId: 42, quantity: 1, displayedUnitPrice: 349.9,
    }))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(fetchProductDetail).toHaveBeenCalledOnce()
    expect(addCartItem).toHaveBeenCalledOnce()
  })
})
