import { QueryClient, QueryClientProvider, QueryObserver } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { AppError } from '../../../shared/errors/appError'
import type { Cart } from '../contracts/cart'
import { cartQueryKeys } from '../queries/useCartQuery'
import { useCartSessionStore } from '../store/cartSessionStore'
import { useDeleteCartItemMutation } from './useDeleteCartItemMutation'

const { deleteCartItem } = vi.hoisted(() => ({ deleteCartItem: vi.fn() }))
vi.mock('../services/deleteCartItemService', () => ({ deleteCartItem }))

const key = cartQueryKeys.detail(20, 900)
const cart: Cart = { customerId: 20, id: 900, createdAt: 'date', items: [
  { id: 7, productId: 1, quantity: 1, unitPrice: 10 },
  { id: 8, productId: 2, quantity: 2, unitPrice: 20 },
  { id: 9, productId: 3, quantity: 3, unitPrice: 30 },
] }

function setup() {
  useCartSessionStore.setState({ cartIdsByCustomer: { '20': 900 } })
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  client.setQueryData(key, cart)
  const wrapper = ({ children }: PropsWithChildren) => <QueryClientProvider client={client}>{children}</QueryClientProvider>
  const hook = renderHook(() => useDeleteCartItemMutation({ customerId: 20, cartId: 900, itemId: 8, token: 'token' }), { wrapper })
  return { client, ...hook }
}

describe('useDeleteCartItemMutation', () => {
  it('optimistically removes only the selected item and keeps it removed after success', async () => {
    let resolve!: (value: { itemId: number; productId: number }) => void
    deleteCartItem.mockReturnValue(new Promise((done) => { resolve = done }))
    const { client, result } = setup()
    act(() => result.current.mutate())
    await waitFor(() => expect(client.getQueryData<Cart>(key)?.items.map((item) => item.id)).toEqual([7, 9]))
    resolve({ itemId: 8, productId: 2 })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(deleteCartItem).toHaveBeenCalledWith(8, 'token')
    expect(client.getQueryData<Cart>(key)?.items.map((item) => item.id)).toEqual([7, 8, 9])
  })

  it('keeps HTTP success but restores only the removed item when canonical GET fails', async () => {
    useCartSessionStore.setState({ cartIdsByCustomer: { '20': 900 } })
    deleteCartItem.mockResolvedValue({ itemId: 8, productId: 2 })
    const { client, result } = setup()
    const observer = new QueryObserver(client, {
      queryKey: key, queryFn: () => Promise.reject(new Error('GET failed')),
      staleTime: Infinity, retry: false,
    })
    const unsubscribe = observer.subscribe(() => undefined)

    await act(() => result.current.mutateAsync())

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(client.getQueryData<Cart>(key)?.items.map((item) => item.id)).toEqual([7, 8, 9])
    expect(client.getQueryState(key)?.status).toBe('error')
    unsubscribe()
  })

  it('selectively restores the item between its surviving anchors while preserving concurrent changes', async () => {
    let reject!: (error: Error) => void
    deleteCartItem.mockReturnValue(new Promise((_, fail) => { reject = fail }))
    const { client, result } = setup()
    act(() => result.current.mutate())
    await waitFor(() => expect(client.getQueryData<Cart>(key)?.items.map((item) => item.id)).toEqual([7, 9]))
    client.setQueryData<Cart>(key, (current) => current && ({
      ...current,
      items: [{ id: 6, productId: 4, quantity: 1, unitPrice: 5 }, ...current.items.map((item) => item.id === 9 ? { ...item, quantity: 5 } : item)],
    }))
    reject(new AppError({ kind: 'network', message: 'fail' }))
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(client.getQueryData<Cart>(key)?.items.map((item) => [item.id, item.quantity])).toEqual([[6, 1], [7, 1], [8, 2], [9, 5]])
  })

  it('does not duplicate an item concurrently restored before rollback', async () => {
    let reject!: (error: Error) => void
    deleteCartItem.mockReturnValue(new Promise((_, fail) => { reject = fail }))
    const { client, result } = setup()
    act(() => result.current.mutate())
    await waitFor(() => expect(client.getQueryData<Cart>(key)?.items).toHaveLength(2))
    client.setQueryData<Cart>(key, (current) => current && ({ ...current, items: [current.items[0], cart.items[1], current.items[1]] }))
    reject(new AppError({ kind: 'network', message: 'fail' }))
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(client.getQueryData<Cart>(key)?.items.map((item) => item.id)).toEqual([7, 8, 9])
  })

  it('does not recreate a private cache removed while the request fails', async () => {
    let reject!: (error: Error) => void
    deleteCartItem.mockReturnValue(new Promise((_, fail) => { reject = fail }))
    const { client, result } = setup()
    act(() => result.current.mutate())
    await waitFor(() => expect(client.getQueryData<Cart>(key)?.items).toHaveLength(2))
    client.removeQueries({ queryKey: key, exact: true })
    reject(new AppError({ kind: 'network', message: 'logout' }))
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(client.getQueryData(key)).toBeUndefined()
  })
})
