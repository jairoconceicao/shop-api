import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { privateCacheMeta } from '../../../shared/query/privateCache'
import { useAuthStore } from '../../auth/store/authStore'
import { useCancelOrderMutation } from './useCancelOrderMutation'

const { cancelOrder } = vi.hoisted(() => ({ cancelOrder: vi.fn() }))
vi.mock('../services/cancelOrderService', () => ({ cancelOrder }))

const session = { token: 'token', tipo: 'Cliente', expiraEm: '2099-01-01T00:00:00Z', usuarioId: 3, clienteId: 7, email: 'a@b.com' }
const attempt = { orderId: 41, customerId: 7, userId: 3, token: 'token' }

describe('useCancelOrderMutation', () => {
  beforeEach(() => {
    cancelOrder.mockReset()
    useAuthStore.getState().clearSession()
    useAuthStore.getState().setSession(session, 'session')
  })

  function setup() {
    const queryClient = new QueryClient()
    const wrapper = ({ children }: PropsWithChildren) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    return { queryClient, ...renderHook(() => useCancelOrderMutation(), { wrapper }) }
  }

  it('disables retry and marks the mutation cache as private', async () => {
    cancelOrder.mockRejectedValue(new Error('offline'))
    const { queryClient, result } = setup()
    act(() => result.current.mutate(attempt))
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(cancelOrder).toHaveBeenCalledOnce()
    expect(queryClient.getMutationCache().getAll()[0]?.meta).toEqual(privateCacheMeta)
  })

  it('accepts only a response for the captured order and customer', async () => {
    cancelOrder.mockResolvedValue({ id: 42, customerId: 7, createdAt: '2026-07-15T12:00:00Z', status: 'Cancelado' })
    const { result } = setup()
    act(() => result.current.mutate(attempt))
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toMatchObject({ kind: 'contract' })
  })

  it('rejects a response completed after the session changes', async () => {
    let resolve!: (value: unknown) => void
    cancelOrder.mockReturnValue(new Promise((done) => { resolve = done }))
    const { result } = setup()
    act(() => result.current.mutate(attempt))
    useAuthStore.getState().setSession({ ...session, token: 'new-token' }, 'session')
    resolve({ id: 41, customerId: 7, createdAt: '2026-07-15T12:00:00Z', status: 'Cancelado' })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toMatchObject({ kind: 'contract' })
  })
})
