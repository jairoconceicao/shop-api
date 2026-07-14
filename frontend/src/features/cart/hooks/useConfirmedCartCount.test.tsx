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

  it('preserva o último total confirmado quando um refetch em background falha', () => {
    useAuthStore.setState({ session })
    useCartSessionStore.setState({ cartIdsByCustomer: { '10': 100 } })
    const client = createClient()
    const key = cartQueryKeys.detail(10, 100)
    const confirmed = cart([{ id: 1, quantity: 2 }])
    client.setQueryData(key, confirmed)
    client.getQueryCache().find({ queryKey: key })?.setState({
      status: 'error', error: new Error('background'), data: confirmed,
    })

    expect(setup(client).result.current).toBe(2)
  })

  it.each([
    ['update', ['cart', 'item', 'update', 10, 100, 1]],
    ['delete', ['cart', 'item', 'delete', 10, 100]],
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
      meta: { private: true },
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

  it.each([
    ['update', ['cart', 'item', 'update', 10, 100, 1], { previousItem: { id: 1, productId: 1, quantity: 2, unitPrice: 10 } }, 9, 3],
    ['delete', ['cart', 'item', 'delete', 10, 100], { item: { id: 1, productId: 1, quantity: 2, unitPrice: 10 } }, 1, 3],
  ])('reconstrói o total confirmado ao montar durante %s pendente', async (_name, mutationKey, context, optimisticQuantity, expected) => {
    useAuthStore.setState({ session })
    useCartSessionStore.setState({ cartIdsByCustomer: { '10': 100 } })
    const client = createClient()
    const key = cartQueryKeys.detail(10, 100)
    client.setQueryData(key, cart([{ id: 2, quantity: 1 }]))
    if (_name === 'update') client.setQueryData(key, cart([{ id: 1, quantity: optimisticQuantity }, { id: 2, quantity: 1 }]))

    let release!: () => void
    const pending = client.getMutationCache().build(client, {
      mutationKey,
      meta: { private: true },
      mutationFn: () => new Promise<void>((resolve) => { release = resolve }),
      onMutate: () => context,
    })
    let execution!: Promise<void>
    await act(async () => { execution = pending.execute(optimisticQuantity); await Promise.resolve() })

    expect(setup(client).result.current).toBe(expected)
    await act(async () => { release(); await execution })
  })

  it('não congela o novo carrinho por mutation pendente da identidade anterior', async () => {
    useAuthStore.setState({ session })
    useCartSessionStore.setState({ cartIdsByCustomer: { '10': 100, '20': 200 } })
    const client = createClient()
    client.setQueryData(cartQueryKeys.detail(10, 100), cart([{ id: 1, quantity: 8 }]))
    client.setQueryData(cartQueryKeys.detail(20, 200), {
      ...cart([{ id: 2, quantity: 4 }]), customerId: 20, id: 200,
    })
    let release!: () => void
    const pending = client.getMutationCache().build(client, {
      mutationKey: ['cart', 'item', 'update', 10, 100, 1],
      meta: { private: true },
      mutationFn: () => new Promise<void>((resolve) => { release = resolve }),
      onMutate: () => ({ previousItem: { id: 1, productId: 1, quantity: 2, unitPrice: 10 } }),
    })
    let execution!: Promise<void>
    await act(async () => { execution = pending.execute(8); await Promise.resolve() })

    useAuthStore.setState({ session: { ...session, clienteId: 20 } })
    expect(setup(client).result.current).toBe(4)
    await act(async () => { release(); await execution })
  })
})
