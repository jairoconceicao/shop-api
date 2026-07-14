import { QueryClient, QueryClientProvider, QueryObserver } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { AppError } from '../../../shared/errors/appError'
import type { Cart } from '../contracts/cart'
import { cartQueryKeys } from '../queries/useCartQuery'
import { useCartSessionStore } from '../store/cartSessionStore'
import { useUpdateCartItemMutation } from './useUpdateCartItemMutation'

const { updateCartItem } = vi.hoisted(() => ({ updateCartItem: vi.fn() }))
vi.mock('../services/updateCartItemService', () => ({ updateCartItem }))

const key = cartQueryKeys.detail(20, 900)
const cart: Cart = { customerId: 20, id: 900, createdAt: 'date', items: [
  { id: 7, productId: 1, quantity: 1, unitPrice: 10 },
  { id: 8, productId: 2, quantity: 2, unitPrice: 20 },
] }

function setup() {
  useCartSessionStore.setState({ cartIdsByCustomer: { '20': 900 } })
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  client.setQueryData(key, cart)
  const wrapper = ({ children }: PropsWithChildren) => <QueryClientProvider client={client}>{children}</QueryClientProvider>
  const hook = renderHook(() => useUpdateCartItemMutation({ customerId: 20, cartId: 900, itemId: 7, token: 'token' }), { wrapper })
  return { client, ...hook }
}

describe('useUpdateCartItemMutation', () => {
  it('keeps the badge snapshot optimistic until success awaits the canonical backend cart', async () => {
    useCartSessionStore.setState({ cartIdsByCustomer: { '20': 900 } })
    updateCartItem.mockResolvedValue({ itemId: 7, productId: 1 })
    const { client, result } = setup()
    const canonical = { ...cart, items: [{ ...cart.items[0], quantity: 3 }, cart.items[1]] }
    let release!: () => void
    const observer = new QueryObserver(client, {
      queryKey: key,
      queryFn: () => new Promise<Cart>((resolve) => { release = () => resolve(canonical) }),
      staleTime: Infinity,
    })
    const unsubscribe = observer.subscribe(() => undefined)

    let mutation!: Promise<unknown>
    act(() => { mutation = result.current.mutateAsync(4) })
    await waitFor(() => expect(client.getQueryData<Cart>(key)?.items[0].quantity).toBe(4))
    expect(result.current.isPending).toBe(true)

    await act(async () => { release(); await mutation })
    expect(client.getQueryData<Cart>(key)?.items[0].quantity).toBe(3)
    unsubscribe()
  })

  it('restores the confirmed item when success cannot reconcile an inactive cache', async () => {
    let resolve!: (value: { itemId: number; productId: number }) => void
    updateCartItem.mockReturnValue(new Promise((done) => { resolve = done }))
    const { client, result } = setup()
    act(() => result.current.mutate(4))
    await waitFor(() => expect(client.getQueryData<Cart>(key)?.items[0].quantity).toBe(4))
    expect(client.getQueryData<Cart>(key)?.items[1].quantity).toBe(2)
    resolve({ itemId: 7, productId: 1 })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(client.getQueryData<Cart>(key)?.items[0].quantity).toBe(1)
    expect(updateCartItem).toHaveBeenCalledWith(7, 'token', { quantidade: 4 })
  })

  it('keeps HTTP success but restores only the confirmed item when canonical GET fails', async () => {
    useCartSessionStore.setState({ cartIdsByCustomer: { '20': 900 } })
    updateCartItem.mockResolvedValue({ itemId: 7, productId: 1 })
    const { client, result } = setup()
    const observer = new QueryObserver(client, {
      queryKey: key, queryFn: () => Promise.reject(new Error('GET failed')),
      staleTime: Infinity, retry: false,
    })
    const unsubscribe = observer.subscribe(() => undefined)

    await act(() => result.current.mutateAsync(4))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(client.getQueryData<Cart>(key)?.items.map((item) => item.quantity)).toEqual([1, 2])
    expect(client.getQueryState(key)?.status).toBe('error')
    unsubscribe()
  })

  it('rolls back only the target item while preserving concurrent cache changes', async () => {
    const callsBefore = updateCartItem.mock.calls.length
    let reject!: (error: Error) => void
    updateCartItem.mockReturnValue(new Promise((_, fail) => { reject = fail }))
    const { client, result } = setup()
    act(() => result.current.mutate(4))
    await waitFor(() => expect(client.getQueryData<Cart>(key)?.items[0].quantity).toBe(4))
    client.setQueryData<Cart>(key, (current) => current && ({ ...current, items: current.items.map((item) => item.id === 8 ? { ...item, quantity: 5 } : item) }))
    reject(new AppError({ kind: 'network', message: 'fail' }))
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(client.getQueryData<Cart>(key)?.items.map((item) => item.quantity)).toEqual([1, 5])
    expect(updateCartItem.mock.calls.length - callsBefore).toBe(1)
  })

  it('does not recreate a private cache removed while the request fails', async () => {
    let reject!: (error: Error) => void
    updateCartItem.mockReturnValue(new Promise((_, fail) => { reject = fail }))
    const { client, result } = setup()
    act(() => result.current.mutate(4))
    await waitFor(() => expect(client.getQueryData(key)).toBeDefined())
    client.removeQueries({ queryKey: key, exact: true })
    reject(new AppError({ kind: 'network', message: 'logout' }))
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(client.getQueryData(key)).toBeUndefined()
  })
})
