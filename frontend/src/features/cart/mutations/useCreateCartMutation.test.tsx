import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AppError } from '../../../shared/errors/appError'
import { useCartSessionStore } from '../store/cartSessionStore'
import { useCreateCartMutation } from './useCreateCartMutation'

const { createCart } = vi.hoisted(() => ({ createCart: vi.fn() }))

vi.mock('../services/createCartService', () => ({ createCart }))

function createWrapper() {
  const queryClient = new QueryClient()
  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useCreateCartMutation', () => {
  beforeEach(() => {
    createCart.mockReset()
    useCartSessionStore.setState({ cartIdsByCustomer: { '10': 100, '20': 200 } })
  })

  it('associates the created cart only with the selected customer after success', async () => {
    createCart.mockResolvedValue({ id: 101, createdAt: '2026-07-14T12:00:00Z' })
    const { result } = renderHook(() => useCreateCartMutation(), { wrapper: createWrapper() })

    await act(() => result.current.mutateAsync({ token: 'access-token', customerId: 10 }))

    expect(createCart).toHaveBeenCalledWith('access-token')
    expect(useCartSessionStore.getState().cartIdsByCustomer).toEqual({
      '10': 101,
      '20': 200,
    })
  })

  it('does not persist a cart association when creation fails', async () => {
    createCart.mockRejectedValue(
      new AppError({ kind: 'http', status: 503, message: 'Serviço indisponível.' }),
    )
    const { result } = renderHook(() => useCreateCartMutation(), { wrapper: createWrapper() })

    act(() => result.current.mutate({ token: 'access-token', customerId: 10 }))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(useCartSessionStore.getState().cartIdsByCustomer).toEqual({
      '10': 100,
      '20': 200,
    })
  })

  it('does not retry cart creation', async () => {
    createCart.mockRejectedValue(new AppError({ kind: 'network', message: 'Sem conexão.' }))
    const { result } = renderHook(() => useCreateCartMutation(), { wrapper: createWrapper() })

    act(() => result.current.mutate({ token: 'access-token', customerId: 10 }))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(createCart).toHaveBeenCalledOnce()
  })
})
