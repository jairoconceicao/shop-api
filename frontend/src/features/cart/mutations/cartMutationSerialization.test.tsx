import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { describe, expect, it, vi } from 'vitest'

import type { Cart } from '../contracts/cart'
import { cartCache } from '../cache/cartCache'
import { useCartSessionStore } from '../store/cartSessionStore'
import { useDeleteCartItemMutation } from './useDeleteCartItemMutation'
import { useUpdateCartItemMutation } from './useUpdateCartItemMutation'

const { deleteCartItem, updateCartItem } = vi.hoisted(() => ({
  deleteCartItem: vi.fn(), updateCartItem: vi.fn(),
}))
vi.mock('../services/deleteCartItemService', () => ({ deleteCartItem }))
vi.mock('../services/updateCartItemService', () => ({ updateCartItem }))

const key = cartCache.query.detail(20, 900)
const cart: Cart = { customerId: 20, id: 900, createdAt: 'date', items: [
  { id: 7, productId: 1, quantity: 2, unitPrice: 10 },
  { id: 8, productId: 2, quantity: 5, unitPrice: 20 },
] }

describe('cart item mutation serialization', () => {
  it('serializes update and delete of the same item and restores only its confirmed snapshot after failures', async () => {
    useCartSessionStore.setState({ cartIdsByCustomer: { '20': 900 } })
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    client.setQueryData(key, cart)
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
    let rejectUpdate!: (error: Error) => void
    updateCartItem.mockReturnValue(new Promise((_, reject) => { rejectUpdate = reject }))
    deleteCartItem.mockRejectedValue(new Error('delete failed'))
    const { result } = renderHook(() => ({
      update: useUpdateCartItemMutation({ customerId: 20, cartId: 900, itemId: 7, token: 'token' }),
      remove: useDeleteCartItemMutation({ customerId: 20, cartId: 900, itemId: 7, token: 'token' }),
    }), { wrapper })

    act(() => {
      result.current.update.mutate(9)
      result.current.remove.mutate()
    })
    await waitFor(() => expect(updateCartItem).toHaveBeenCalledOnce())
    expect(deleteCartItem).not.toHaveBeenCalled()

    rejectUpdate(new Error('update failed'))
    await waitFor(() => expect(deleteCartItem).toHaveBeenCalledOnce())
    await waitFor(() => expect(result.current.remove.isError).toBe(true))
    expect(client.getQueryData<Cart>(key)?.items.map((item) => item.quantity)).toEqual([2, 5])
  })
})
