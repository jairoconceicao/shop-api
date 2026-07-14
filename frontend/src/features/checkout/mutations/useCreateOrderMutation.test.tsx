import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '../../auth/store/authStore'
import { clearPrivateCache } from '../../../shared/query/privateCache'
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
