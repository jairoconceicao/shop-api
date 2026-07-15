import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AppError } from '../../../shared/errors/appError'
import { useAuthStore } from '../../auth/store/authStore'
import { cartQueryKeys } from '../../cart/queries/useCartQuery'
import { useCartSessionStore } from '../../cart/store/cartSessionStore'
import { clearPrivateCache } from '../../../shared/query/privateCache'
import { orderQueryKeys } from '../cache/orderCache'
import { useCreateOrderMutation } from './useCreateOrderMutation'

const { createOrder } = vi.hoisted(() => ({ createOrder: vi.fn() }))

vi.mock('../services/createOrderService', () => ({ createOrder }))

const cart = {
  customerId: 7, id: 30, createdAt: '2026-07-14T12:00:00Z',
  items: [{ id: 1, productId: 10, quantity: 2, unitPrice: 25.5 }],
}
const values = {
  enderecoEntrega: {
    logradouro: 'Rua das Flores', numero: '42', complemento: null,
    cep: '12345678', bairro: 'Centro', cidade: 'São Paulo', uf: 'SP',
  },
  formaPagamento: 'Pix' as const,
}

describe('useCreateOrderMutation', () => {
  beforeEach(() => {
    createOrder.mockReset()
    useAuthStore.setState({
      session: {
        token: 'access-token', tipo: 'Cliente', expiraEm: '2099-01-01T00:00:00Z',
        usuarioId: 4, clienteId: 7, email: 'cliente@exemplo.com',
      },
    })
    useCartSessionStore.setState({ cartIdsByCustomer: { 7: 30, 8: 40 } })
  })

  it('reconciles only the confirmed customer cart and invalidates future order queries after success', async () => {
    const created = {
      id: 99, customerId: 7, createdAt: '2026-07-14T14:00:00Z',
      paymentMethod: 'Pix', status: 'Criado', total: 51,
    }
    createOrder.mockResolvedValueOnce(created)
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    const confirmedCartKey = cartQueryKeys.detail(7, 30)
    const otherCartKey = cartQueryKeys.detail(8, 40)
    client.setQueryData(confirmedCartKey, cart)
    client.setQueryData(otherCartKey, { ...cart, customerId: 8, id: 40 })
    client.setQueryData([...orderQueryKeys.all, 'list'], ['stale-order'])
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useCreateOrderMutation(), { wrapper })

    let response: unknown
    await act(async () => {
      response = await result.current.mutateAsync({ values, cart })
    })

    expect(response).toBe(created)
    expect(useCartSessionStore.getState().getCartId(7)).toBeUndefined()
    expect(useCartSessionStore.getState().getCartId(8)).toBe(40)
    expect(client.getQueryData(confirmedCartKey)).toBeUndefined()
    expect(client.getQueryData(otherCartKey)).toBeDefined()
    expect(client.getQueryState([...orderQueryKeys.all, 'list'])?.isInvalidated).toBe(true)
  })

  it.each([409, 422])('does not reconcile cart or order caches when creation fails with %i', async (status) => {
    createOrder.mockRejectedValueOnce(new AppError({ kind: 'http', status, message: 'failed' }))
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    const confirmedCartKey = cartQueryKeys.detail(7, 30)
    const orderKey = [...orderQueryKeys.all, 'list'] as const
    client.setQueryData(confirmedCartKey, cart)
    client.setQueryData(orderKey, ['existing-order'])
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useCreateOrderMutation(), { wrapper })

    await expect(act(async () => result.current.mutateAsync({ values, cart }))).rejects.toThrow('failed')

    expect(useCartSessionStore.getState().getCartId(7)).toBe(30)
    expect(client.getQueryData(confirmedCartKey)).toBe(cart)
    expect(client.getQueryState(orderKey)?.isInvalidated).toBe(false)
  })

  it('maps form values and confirmed cart items and delegates creation to the service', async () => {
    const created = {
      id: 99, customerId: 7, createdAt: '2026-07-14T14:00:00Z',
      paymentMethod: 'Pix', status: 'Criado', total: 51,
    }
    createOrder.mockResolvedValueOnce(created)
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useCreateOrderMutation(), { wrapper })

    let response: unknown
    await act(async () => {
      response = await result.current.mutateAsync({ values, cart })
    })

    expect(createOrder).toHaveBeenCalledWith({
      enderecoEntrega: values.enderecoEntrega,
      formaPagamento: 'Pix',
      items: [{ itemId: 1, produtoId: 10, quantidade: 2, valorUnitario: 25.5 }],
    }, 'access-token')
    expect(response).toBe(created)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('marks order creation private so logout cleanup removes its variables and response', async () => {
    createOrder.mockResolvedValueOnce({
      id: 99, customerId: 7, createdAt: '2026-07-14T14:00:00Z',
      paymentMethod: 'Pix', status: 'Criado', total: 51,
    })
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useCreateOrderMutation(), { wrapper })

    await act(async () => { await result.current.mutateAsync({ values, cart }) })
    const mutation = client.getMutationCache().find({ mutationKey: ['checkout', 'create-order'] })
    expect(mutation?.state.variables).toEqual({ values, cart })
    expect(mutation?.state.data).toMatchObject({ id: 99 })

    clearPrivateCache(client)

    expect(client.getMutationCache().find({ mutationKey: ['checkout', 'create-order'] }))
      .toBeUndefined()
  })
})
