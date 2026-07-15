import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '../../auth/store/authStore'
import { orderDetailQueryOptions, useOrderDetailQuery } from './useOrderDetailQuery'

const { getOrder } = vi.hoisted(() => ({ getOrder: vi.fn() }))
vi.mock('../services/getOrderService', () => ({ getOrder }))

function wrapper({ children }: PropsWithChildren) {
  return <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{children}</QueryClientProvider>
}

describe('order detail query', () => {
  beforeEach(() => { getOrder.mockReset(); useAuthStore.getState().clearSession() })

  it('uses a private customer/order key and forwards the signal', async () => {
    const signal = new AbortController().signal
    const options = orderDetailQueryOptions({ customerId: 7, orderId: 41, token: 'token' })
    getOrder.mockResolvedValue({ id: 41 })
    await options.queryFn?.({ signal } as never)
    expect(options.queryKey).toEqual(['private', 'orders', 'detail', 7, 41])
    expect(options.meta).toEqual({ private: true })
    expect(getOrder).toHaveBeenCalledWith(41, 'token', signal)
  })

  it('disables invalid routes and never requests sentinel order zero', () => {
    const options = orderDetailQueryOptions({ customerId: 7, orderId: undefined, token: 'token' })
    expect(options.enabled).toBe(false)
    expect(options.queryKey).not.toContain(0)
  })

  it('captures the active auth session', async () => {
    useAuthStore.getState().setSession({ token: 'token', tipo: 'Cliente', expiraEm: '2099-01-01T00:00:00Z', usuarioId: 1, clienteId: 7, email: 'a@b.com' }, 'session')
    getOrder.mockResolvedValue({ id: 41 })
    const { result } = renderHook(() => useOrderDetailQuery(41), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(getOrder).toHaveBeenCalledWith(41, 'token', expect.any(AbortSignal))
  })

  it('isolates the cache when the session changes for the same customer', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const stableWrapper = ({ children }: PropsWithChildren) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    let resolveOld!: (value: { id: number; source: string }) => void
    getOrder.mockReturnValueOnce(new Promise((resolve) => { resolveOld = resolve })).mockResolvedValueOnce({ id: 41, source: 'new' })
    useAuthStore.getState().setSession({ token: 'old-token', tipo: 'Cliente', expiraEm: '2099-01-01T00:00:00Z', usuarioId: 1, clienteId: 7, email: 'old@b.com' }, 'session')
    const { result } = renderHook(() => useOrderDetailQuery(41), { wrapper: stableWrapper })
    await waitFor(() => expect(getOrder).toHaveBeenCalledTimes(1))
    useAuthStore.getState().setSession({ token: 'new-token', tipo: 'Cliente', expiraEm: '2099-01-01T00:00:00Z', usuarioId: 2, clienteId: 7, email: 'new@b.com' }, 'session')
    await waitFor(() => expect(getOrder).toHaveBeenCalledTimes(2))
    await waitFor(() => expect(result.current.data).toEqual({ id: 41, source: 'new' }))
    resolveOld({ id: 41, source: 'old' })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(result.current.data).toEqual({ id: 41, source: 'new' })
    expect(JSON.stringify(queryClient.getQueryCache().getAll().map((query) => query.queryKey))).not.toMatch(/old-token|new-token/)
  })
})
