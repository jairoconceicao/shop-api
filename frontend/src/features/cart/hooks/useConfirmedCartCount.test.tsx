import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import type { Cart } from '../contracts/cart'
import { useAuthStore } from '../../auth/store/authStore'
import { cartQueryKeys } from '../queries/useCartQuery'
import { useCartSessionStore } from '../store/cartSessionStore'
import { useConfirmedCartCount } from './useConfirmedCartCount'

const session = {
  token: 'token', tipo: 'Cliente', expiraEm: '2099-01-01T00:00:00Z',
  usuarioId: 1, clienteId: 10, email: 'cliente@shop.test',
}

function cart(items: Array<{ id: number; quantity: number }>): Cart {
  return {
    customerId: 10, id: 100, createdAt: '2026-01-01T00:00:00Z',
    items: items.map(({ id, quantity }) => ({ id, quantity, productId: id, unitPrice: 10 })),
  }
}

function createClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } })
}

function setup(client = createClient()) {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  return { client, ...renderHook(() => useConfirmedCartCount(), { wrapper }) }
}

beforeEach(() => {
  useAuthStore.setState({ session: null })
  useCartSessionStore.setState({ cartIdsByCustomer: {} })
})

describe('useConfirmedCartCount', () => {
  it('soma as quantidades raw do carrinho confirmado', () => {
    useAuthStore.setState({ session })
    useCartSessionStore.setState({ cartIdsByCustomer: { '10': 100 } })
    const client = createClient()
    client.setQueryData(cartQueryKeys.detail(10, 100), cart([{ id: 1, quantity: 2 }, { id: 2, quantity: 3 }]))

    expect(setup(client).result.current).toBe(5)
  })

  it('retorna zero para visitante, cliente sem vínculo e consulta com erro', () => {
    expect(setup().result.current).toBe(0)

    useAuthStore.setState({ session })
    expect(setup().result.current).toBe(0)

    useCartSessionStore.setState({ cartIdsByCustomer: { '10': 100 } })
    const client = createClient()
    client.setQueryData(cartQueryKeys.detail(10, 100), cart([{ id: 1, quantity: 2 }]))
    client.getQueryCache().find({ queryKey: cartQueryKeys.detail(10, 100) })?.setState({
      status: 'error', error: new Error('falha'), data: undefined,
    })
    expect(setup(client).result.current).toBe(0)
  })

  it.each([
    ['update', ['cart', 'item', 1, 'quantity']],
    ['delete', ['cart', 'item', 'delete']],
  ])('congela o último total durante %s otimista e atualiza ao concluir', async (_name, mutationKey) => {
    useAuthStore.setState({ session })
    useCartSessionStore.setState({ cartIdsByCustomer: { '10': 100 } })
    const key = cartQueryKeys.detail(10, 100)
    const client = createClient()
    client.setQueryData(key, cart([{ id: 1, quantity: 2 }, { id: 2, quantity: 1 }]))
    const { result } = setup(client)
    expect(result.current).toBe(3)

    let release!: () => void
    const pending = client.getMutationCache().build(client, {
      mutationKey,
      mutationFn: () => new Promise<void>((resolve) => { release = resolve }),
    })
    let execution!: Promise<void>
    await act(async () => { execution = pending.execute(undefined); await Promise.resolve() })
    act(() => client.setQueryData(key, cart([{ id: 1, quantity: 8 }, { id: 2, quantity: 1 }])))
    expect(result.current).toBe(3)

    await act(async () => { release(); await execution })
    await waitFor(() => expect(result.current).toBe(9))
  })

  it('não congela o total durante adição', async () => {
    useAuthStore.setState({ session })
    useCartSessionStore.setState({ cartIdsByCustomer: { '10': 100 } })
    const key = cartQueryKeys.detail(10, 100)
    const client = createClient()
    client.setQueryData(key, cart([{ id: 1, quantity: 1 }]))
    const { result } = setup(client)

    let release!: () => void
    const pending = client.getMutationCache().build(client, {
      mutationKey: ['cart', 'item', 'add'],
      mutationFn: () => new Promise<void>((resolve) => { release = resolve }),
    })
    let execution!: Promise<void>
    await act(async () => { execution = pending.execute(undefined); await Promise.resolve() })
    act(() => client.setQueryData(key, cart([{ id: 1, quantity: 1 }, { id: 2, quantity: 2 }])))
    await waitFor(() => expect(result.current).toBe(3))
    await act(async () => { release(); await execution })
  })
})
