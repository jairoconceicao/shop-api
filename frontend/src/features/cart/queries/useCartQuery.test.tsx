import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AppError } from '../../../shared/errors/appError'
import type { AuthSession } from '../../auth/store/authStore'
import { useAuthStore } from '../../auth/store/authStore'
import { useCartSessionStore } from '../store/cartSessionStore'
import { cartQueryKeys, cartQueryOptions, useCartQuery } from './useCartQuery'

const { getCart } = vi.hoisted(() => ({ getCart: vi.fn() }))

vi.mock('../services/getCartService', () => ({ getCart }))

const session = (customerId: number, token = `token-${customerId}`): AuthSession => ({
  token,
  tipo: 'Bearer',
  expiraEm: '2099-07-14T12:00:00Z',
  usuarioId: customerId,
  clienteId: customerId,
  email: `customer-${customerId}@example.com`,
})

function createHarness() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { queryClient, wrapper }
}

describe('useCartQuery', () => {
  beforeEach(() => {
    getCart.mockReset()
    useAuthStore.setState({ session: session(10) })
    useCartSessionStore.setState({ cartIdsByCustomer: {} })
  })

  it('enables only a complete association and inherits global retry/cache defaults', () => {
    const enabled = cartQueryOptions(10, 100, 'token-10')
    const missingCart = cartQueryOptions(10, undefined, 'token-10')

    expect(enabled.enabled).toBe(true)
    expect(missingCart.enabled).toBe(false)
    expect(enabled).not.toHaveProperty('retry')
    expect(enabled).not.toHaveProperty('staleTime')
    expect(enabled).not.toHaveProperty('gcTime')
  })

  it('uses a private customer/cart key without exposing the token', () => {
    useCartSessionStore.setState({ cartIdsByCustomer: { '10': 100 } })
    getCart.mockResolvedValue({ customerId: 10, id: 100, createdAt: '', items: [] })
    const { queryClient, wrapper } = createHarness()

    renderHook(() => useCartQuery(), { wrapper })

    const query = queryClient.getQueryCache().find({ queryKey: cartQueryKeys.detail(10, 100) })
    expect(query?.queryKey).toEqual(['cart', 'detail', 10, 100])
    expect(query?.queryKey).not.toContain('token-10')
    expect(query?.meta).toEqual({ private: true })
  })

  it('represents a missing association without fetching or inventing a cart', () => {
    const { queryClient, wrapper } = createHarness()
    const { result } = renderHook(() => useCartQuery(), { wrapper })

    expect(result.current.hasCart).toBe(false)
    expect(result.current.data).toBeUndefined()
    expect(result.current.isPending).toBe(true)
    expect(result.current.fetchStatus).toBe('idle')
    expect(getCart).not.toHaveBeenCalled()
    expect(queryClient.getQueryData(cartQueryKeys.detail(10, null))).toBeUndefined()
  })

  it('reacts to a cart association added to the current customer store entry', async () => {
    getCart.mockResolvedValue({ customerId: 10, id: 101, createdAt: '', items: [] })
    const { wrapper } = createHarness()
    const { result } = renderHook(() => useCartQuery(), { wrapper })

    act(() => useCartSessionStore.getState().setCartId(10, 101))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.hasCart).toBe(true)
    expect(getCart).toHaveBeenCalledWith(101, 'token-10', expect.any(AbortSignal))
  })

  it('keeps the remote cart only in the query cache', async () => {
    const cart = { customerId: 10, id: 100, createdAt: '', items: [] }
    useCartSessionStore.setState({ cartIdsByCustomer: { '10': 100 } })
    getCart.mockResolvedValue(cart)
    const { queryClient, wrapper } = createHarness()
    const { result } = renderHook(() => useCartQuery(), { wrapper })

    await waitFor(() => expect(result.current.data).toEqual(cart))
    expect(queryClient.getQueryData(cartQueryKeys.detail(10, 100))).toEqual(cart)
    expect(useCartSessionStore.getState().cartIdsByCustomer).toEqual({ '10': 100 })
  })

  it('exposes errors and permits a manual refetch', async () => {
    const error = new AppError({ kind: 'network', message: 'Sem conexão.' })
    useCartSessionStore.setState({ cartIdsByCustomer: { '10': 100 } })
    getCart.mockRejectedValueOnce(error).mockResolvedValueOnce({
      customerId: 10, id: 100, createdAt: '', items: [],
    })
    const { wrapper } = createHarness()
    const { result } = renderHook(() => useCartQuery(), { wrapper })

    await waitFor(() => expect(result.current.error).toBe(error))
    await act(() => result.current.refetch())
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(getCart).toHaveBeenCalledTimes(2)
  })

  it('preserves a cart association after a 404', async () => {
    useCartSessionStore.setState({ cartIdsByCustomer: { '10': 100 } })
    getCart.mockRejectedValue(new AppError({ kind: 'http', status: 404, message: 'Ausente.' }))
    const { wrapper } = createHarness()
    const { result } = renderHook(() => useCartQuery(), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.hasCart).toBe(true)
    expect(useCartSessionStore.getState().cartIdsByCustomer).toEqual({ '10': 100 })
  })

  it('switches customer subscriptions and keeps every private cache entry isolated', async () => {
    useCartSessionStore.setState({ cartIdsByCustomer: { '10': 100, '20': 200 } })
    getCart.mockImplementation(async (cartId: number) => ({
      customerId: cartId / 10, id: cartId, createdAt: '', items: [],
    }))
    const { queryClient, wrapper } = createHarness()
    const { result } = renderHook(() => useCartQuery(), { wrapper })

    await waitFor(() => expect(result.current.data?.id).toBe(100))
    act(() => useAuthStore.setState({ session: session(20) }))
    await waitFor(() => expect(result.current.data?.id).toBe(200))

    expect(getCart).toHaveBeenLastCalledWith(200, 'token-20', expect.any(AbortSignal))
    for (const key of [cartQueryKeys.detail(10, 100), cartQueryKeys.detail(20, 200)]) {
      expect(queryClient.getQueryCache().find({ queryKey: key })?.meta).toEqual({ private: true })
    }
  })
})
