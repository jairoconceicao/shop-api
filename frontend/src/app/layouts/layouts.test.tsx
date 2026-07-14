import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act } from '@testing-library/react'

import { useAuthStore } from '../../features/auth/store/authStore'
import { cartQueryKeys } from '../../features/cart/queries/useCartQuery'
import { useCartSessionStore } from '../../features/cart/store/cartSessionStore'

const { fetchCategories } = vi.hoisted(() => ({ fetchCategories: vi.fn() }))
vi.mock('../../features/catalog/services/categoryService', () => ({ fetchCategories }))

beforeEach(() => {
  fetchCategories.mockResolvedValue([])
  useAuthStore.setState({ session: null })
  useCartSessionStore.setState({ cartIdsByCustomer: {} })
})

import { AccountLayout } from './AccountLayout'
import { StoreLayout } from './StoreLayout'

function StoreTestProviders({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
    </MemoryRouter>
  )
}

describe('StoreLayout', () => {
  it('keeps the store content between the global header and footer', () => {
    const { container } = render(
      <StoreTestProviders>
        <Routes>
          <Route element={<StoreLayout />}>
            <Route index element={<h1>Catálogo</h1>} />
          </Route>
        </Routes>
      </StoreTestProviders>,
    )

    const shell = container.querySelector('[data-shell="store"]')

    expect(shell).toHaveClass('min-h-dvh', 'flex-col')
    expect(shell?.querySelector('header')).toBeInTheDocument()
    expect(shell?.querySelector('main')).toHaveClass('min-w-0', 'flex-1')
    expect(shell?.querySelector('footer')).toBeInTheDocument()
  })

  it('carrega categorias reais também em rotas filhas', async () => {
    fetchCategories.mockResolvedValue([{ id: 7, title: 'Games', description: null }])

    render(
      <MemoryRouter initialEntries={['/carrinho?searchword=console&page=3']}>
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
          <Routes>
            <Route element={<StoreLayout />}>
              <Route path="carrinho" element={<h1>Carrinho</h1>} />
            </Route>
          </Routes>
        </QueryClientProvider>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('link', { name: 'Games' })).toHaveAttribute(
      'href',
      '/?searchword=console&categoriaId=7',
    )
  })

  it('atualiza o contador confirmado do Header pelo cache sem reload', async () => {
    useAuthStore.setState({
      session: {
        token: 'token', tipo: 'Cliente', expiraEm: '2099-01-01T00:00:00Z',
        usuarioId: 1, clienteId: 10, email: 'cliente@shop.test',
      },
    })
    useCartSessionStore.setState({ cartIdsByCustomer: { '10': 100 } })
    const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } })
    const key = cartQueryKeys.detail(10, 100)
    client.setQueryData(key, {
      customerId: 10, id: 100, createdAt: '2026-01-01T00:00:00Z',
      items: [{ id: 1, productId: 2, quantity: 2, unitPrice: 10 }],
    })

    render(
      <MemoryRouter>
        <QueryClientProvider client={client}>
          <Routes>
            <Route element={<StoreLayout />}>
              <Route index element={<h1>Catálogo</h1>} />
            </Route>
          </Routes>
        </QueryClientProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Carrinho com 2 itens' })).toBeInTheDocument()

    act(() => client.setQueryData(key, {
      customerId: 10, id: 100, createdAt: '2026-01-01T00:00:00Z',
      items: [{ id: 1, productId: 2, quantity: 4, unitPrice: 10 }],
    }))

    expect(await screen.findByRole('link', { name: 'Carrinho com 4 itens' })).toBeInTheDocument()
  })

  it.each([
    ['update', ['cart', 'item', 'update', 10, 100, 1], { previousItem: { id: 1, productId: 2, quantity: 2, unitPrice: 10 } }, 8],
    ['delete', ['cart', 'item', 'delete', 10, 100], { item: { id: 1, productId: 2, quantity: 2, unitPrice: 10 } }, undefined],
  ])('monta o Header com total confirmado durante %s pendente', async (_name, mutationKey, context, optimisticQuantity) => {
    useAuthStore.setState({
      session: {
        token: 'token', tipo: 'Cliente', expiraEm: '2099-01-01T00:00:00Z',
        usuarioId: 1, clienteId: 10, email: 'cliente@shop.test',
      },
    })
    useCartSessionStore.setState({ cartIdsByCustomer: { '10': 100 } })
    const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } })
    client.setQueryData(cartQueryKeys.detail(10, 100), {
      customerId: 10, id: 100, createdAt: '2026-01-01T00:00:00Z',
      items: optimisticQuantity === undefined
        ? [{ id: 2, productId: 3, quantity: 1, unitPrice: 5 }]
        : [
            { id: 1, productId: 2, quantity: optimisticQuantity, unitPrice: 10 },
            { id: 2, productId: 3, quantity: 1, unitPrice: 5 },
          ],
    })
    let release!: () => void
    const pending = client.getMutationCache().build(client, {
      mutationKey,
      mutationFn: () => new Promise<void>((resolve) => { release = resolve }),
      onMutate: () => context,
    })
    const execution = pending.execute(optimisticQuantity)
    await Promise.resolve()

    render(
      <MemoryRouter>
        <QueryClientProvider client={client}>
          <Routes><Route element={<StoreLayout />}><Route index element={<h1>Catálogo</h1>} /></Route></Routes>
        </QueryClientProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Carrinho com 3 itens' })).toBeInTheDocument()
    release()
    await execution
  })
})

describe('AccountLayout', () => {
  it('renders responsive account navigation and marks the current page', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/minha-conta/senha']}>
        <Routes>
          <Route path="minha-conta" element={<AccountLayout />}>
            <Route path="senha" element={<h1>Alterar senha</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    const navigation = screen.getByRole('navigation', { name: 'Navegação da conta' })

    expect(navigation).toHaveClass('overflow-x-auto')
    expect(screen.getByRole('link', { name: 'Meus dados' })).toHaveAttribute(
      'href',
      '/minha-conta/dados',
    )
    expect(screen.getByRole('link', { name: 'Trocar senha' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: 'Meus pedidos' })).toHaveAttribute('href', '/pedidos')
    expect(container.querySelector('[data-shell="account"]')).toHaveClass('max-w-3xl')
    expect(screen.getByRole('heading', { name: 'Alterar senha' })).toBeInTheDocument()
  })
})
