import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '../../auth/store/authStore'
import { ordersQueryOptions, useOrdersQuery } from './useOrdersQuery'

const { listOrders, useCustomerProfileQuery } = vi.hoisted(() => ({
  listOrders: vi.fn(),
  useCustomerProfileQuery: vi.fn(),
}))
vi.mock('../services/listOrdersService', () => ({ listOrders }))
vi.mock('../../customer/queries/useCustomerProfileQuery', () => ({ useCustomerProfileQuery }))

const filters = { start: '2026-07-01', end: '2026-07-15', page: 2 }
const validInput = { customerId: 7, cpf: '123.456.789-01', token: 'token', filters }

function wrapper({ children }: PropsWithChildren) {
  return <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{children}</QueryClientProvider>
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((accept) => { resolve = accept })
  return { promise, resolve }
}

describe('ordersQueryOptions', () => {
  beforeEach(() => { listOrders.mockReset(); useCustomerProfileQuery.mockReset(); useAuthStore.getState().clearSession() })

  it('does not expose cpf or token in the query key', () => {
    const options = ordersQueryOptions(validInput)
    expect(JSON.stringify(options.queryKey)).not.toContain('12345678901')
    expect(JSON.stringify(options.queryKey)).not.toContain('token')
    expect(options.queryKey).toEqual(['private', 'orders', 'list', 7, filters.start, filters.end, 2, 20])
    expect(options.meta).toEqual({ private: true })
  })

  it('disables invalid sessions and uses a neutral key', () => {
    const options = ordersQueryOptions({ customerId: 0, cpf: '123', token: ' ', filters })
    expect(options.enabled).toBe(false)
    expect(options.queryKey).toEqual(['private', 'orders', 'list', 0, null, null, 1, 20])
  })

  it('normalizes cpf and forwards abort signal', async () => {
    const signal = new AbortController().signal
    listOrders.mockResolvedValue({ orders: [] })
    const options = ordersQueryOptions(validInput)
    await options.queryFn?.({ signal } as never)
    expect(listOrders).toHaveBeenCalledWith({ cpf: '12345678901', ...filters, size: 20 }, 'token', signal)
  })

  it('reads the confirmed profile cpf with the current session', async () => {
    useAuthStore.getState().setSession({ token: 'token', tipo: 'Cliente', expiraEm: '2099-01-01T00:00:00Z', usuarioId: 1, clienteId: 7, email: 'a@b.com' }, 'session')
    useCustomerProfileQuery.mockReturnValue({ data: { cpf: '12345678901' } })
    listOrders.mockResolvedValue({ pages: 0, size: 20, totalItems: 0, orders: [] })
    const { result } = renderHook(() => useOrdersQuery({ page: 1 }), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(useCustomerProfileQuery).toHaveBeenCalledWith()
    expect(listOrders).toHaveBeenCalledWith({ cpf: '12345678901', start: undefined, end: undefined, page: 1, size: 20 }, 'token', expect.any(AbortSignal))
  })

  it('isolates a late response when token and confirmed cpf change for the same customer', async () => {
    const oldResponse = deferred<{ orders: string[] }>()
    const newResponse = deferred<{ orders: string[] }>()
    listOrders.mockImplementationOnce(() => oldResponse.promise).mockImplementationOnce(() => newResponse.promise)
    useCustomerProfileQuery.mockImplementation(() => ({
      data: { cpf: useAuthStore.getState().session?.token === 'old-token' ? '12345678901' : '98765432100' },
    }))
    useAuthStore.getState().setSession({ token: 'old-token', tipo: 'Cliente', expiraEm: '2099-01-01T00:00:00Z', usuarioId: 1, clienteId: 7, email: 'old@shop.test' }, 'session')
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const stableWrapper = ({ children }: PropsWithChildren) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    const { result } = renderHook(() => useOrdersQuery({ page: 1 }), { wrapper: stableWrapper })
    await waitFor(() => expect(listOrders).toHaveBeenCalledTimes(1))

    useAuthStore.getState().setSession({ token: 'new-token', tipo: 'Cliente', expiraEm: '2099-01-01T00:00:00Z', usuarioId: 2, clienteId: 7, email: 'new@shop.test' }, 'session')
    await waitFor(() => expect(listOrders).toHaveBeenCalledTimes(2))
    newResponse.resolve({ orders: ['new'] })
    await waitFor(() => expect(result.current.data).toEqual({ orders: ['new'] }))
    oldResponse.resolve({ orders: ['old'] })
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(result.current.data).toEqual({ orders: ['new'] })
    expect(queryClient.getQueryCache().getAll()).toHaveLength(2)
    expect(JSON.stringify(queryClient.getQueryCache().getAll().map((query) => query.queryKey))).not.toMatch(/old-token|new-token|12345678901|98765432100/)
  })
})
