import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { privateCacheMeta } from '../../../shared/query/privateCache'
import { AppError } from '../../../shared/errors/appError'
import { useAuthStore } from '../../auth/store/authStore'
import { orderQueryKeys } from '../cache/orderQueryKeys'
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

  it('reconciles every scoped copy of the exact detail and every list for the customer after success', async () => {
    cancelOrder.mockResolvedValue({ id: 41, customerId: 7, createdAt: '2026-07-15T12:00:00Z', status: 'Cancelado' })
    const { queryClient, result } = setup()
    const detailA = [...orderQueryKeys.detail(7, 41), 101] as const
    const detailB = [...orderQueryKeys.detail(7, 41), 202] as const
    const otherOrder = [...orderQueryKeys.detail(7, 42), 101] as const
    const otherCustomer = [...orderQueryKeys.detail(8, 41), 101] as const
    const listA = [...orderQueryKeys.list(7, undefined, undefined, 1, 20), 101] as const
    const listB = [...orderQueryKeys.list(7, '2026-07-01', '2026-07-31', 2, 20), 202] as const
    const otherCustomerList = [...orderQueryKeys.list(8, undefined, undefined, 1, 20), 101] as const
    const currentOrder = { id: 41, customerId: 7, createdAt: '2026-07-15T12:00:00Z', status: 'Criado' as const }
    queryClient.setQueryData(detailA, currentOrder)
    queryClient.setQueryData(detailB, currentOrder)
    queryClient.setQueryData(otherOrder, { ...currentOrder, id: 42 })
    queryClient.setQueryData(otherCustomer, { ...currentOrder, customerId: 8 })
    queryClient.setQueryData(listA, { page: 1 })
    queryClient.setQueryData(listB, { page: 2 })
    queryClient.setQueryData(otherCustomerList, { page: 1 })
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    await act(async () => { await result.current.mutateAsync(attempt) })

    expect(queryClient.getQueryData(detailA)).toMatchObject({ status: 'Cancelado' })
    expect(queryClient.getQueryData(detailB)).toMatchObject({ status: 'Cancelado' })
    expect(queryClient.getQueryData(otherOrder)).toMatchObject({ status: 'Criado' })
    expect(queryClient.getQueryData(otherCustomer)).toMatchObject({ status: 'Criado' })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: orderQueryKeys.detail(7, 41) })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: orderQueryKeys.lists(7) })
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: orderQueryKeys.lists(8) })
  })

  it.each([
    ['mismatched response', () => cancelOrder.mockResolvedValue({ id: 42, customerId: 7, createdAt: '2026-07-15T12:00:00Z', status: 'Cancelado' })],
    ['late session', () => {
      cancelOrder.mockImplementation(async () => {
        useAuthStore.getState().setSession({ ...session, token: 'new-token' }, 'session')
        return { id: 41, customerId: 7, createdAt: '2026-07-15T12:00:00Z', status: 'Cancelado' }
      })
    }],
  ])('does not run success cache effects for a %s', async (_scenario, arrange) => {
    arrange()
    const { queryClient, result } = setup()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    await expect(result.current.mutateAsync(attempt)).rejects.toMatchObject({ kind: 'contract' })

    expect(invalidate).not.toHaveBeenCalled()
  })

  it('refetches the active session-scoped detail before returning the rejected outcome', async () => {
    cancelOrder.mockRejectedValue(new AppError({ kind: 'http', status: 422, message: 'Transição recusada' }))
    const queryClient = new QueryClient()
    const wrapper = ({ children }: PropsWithChildren) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    const getOrder = vi.fn()
      .mockResolvedValueOnce({ status: 'Criado' })
      .mockResolvedValueOnce({ status: 'Processado' })
    const detailKey = [...orderQueryKeys.detail(7, 41), 99] as const
    const { result } = renderHook(() => ({
      detail: useQuery({
        queryKey: detailKey,
        queryFn: getOrder,
      }),
      cancellation: useCancelOrderMutation(),
    }), { wrapper })
    await waitFor(() => expect(result.current.detail.data).toEqual({ status: 'Criado' }))

    let outcome: unknown
    await act(async () => { outcome = await result.current.cancellation.mutateAsync(attempt) })

    expect(outcome).toEqual({ kind: 'cancel-rejected' })
    expect(getOrder).toHaveBeenCalledTimes(2)
    expect(queryClient.getQueryData(detailKey)).toEqual({ status: 'Processado' })
    expect(cancelOrder).toHaveBeenCalledOnce()
  })

  it('keeps the rejected outcome when reconciliation fails', async () => {
    cancelOrder.mockRejectedValue(new AppError({ kind: 'http', status: 422, message: 'Transição recusada' }))
    const { queryClient, result } = setup()
    vi.spyOn(queryClient, 'invalidateQueries').mockRejectedValue(new Error('refetch failed'))

    let outcome: unknown
    await act(async () => { outcome = await result.current.mutateAsync(attempt) })

    expect(outcome).toEqual({ kind: 'cancel-rejected' })
    expect(result.current.isError).toBe(false)
  })
})
