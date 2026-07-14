import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'
import { useAuthStore } from './features/auth/store/authStore'

const { fetchProductDetail } = vi.hoisted(() => ({ fetchProductDetail: vi.fn() }))
vi.mock('./features/catalog/services/productDetailService', () => ({ fetchProductDetail }))

describe('App', () => {
  const queryClient = new QueryClient()

  function renderApp(route: string) {
    return render(
      <MemoryRouter initialEntries={[route]}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </MemoryRouter>,
    )
  }

  beforeEach(() => {
    queryClient.clear()
    fetchProductDetail.mockReset()
    fetchProductDetail.mockResolvedValue({
      id: 42,
      title: 'Notebook Pro 14',
      description: 'Descrição',
      model: 'NP14',
      photo: null,
      price: 5299.9,
      stock: 7,
      category: { id: 3, title: 'Informática' },
    })
    useAuthStore.getState().setSession(
      {
        token: 'header.payload.signature',
        tipo: 'Bearer',
        expiraEm: '2099-01-01T00:00:00Z',
        usuarioId: 10,
        clienteId: 20,
        email: 'cliente@exemplo.com',
      },
      'session',
    )
  })

  it('renders the product detail page in the store route', async () => {
    const { container } = renderApp('/produtos/42')

    expect(await screen.findByRole('heading', { level: 1, name: 'Notebook Pro 14' })).toBeInTheDocument()
    expect(fetchProductDetail).toHaveBeenCalledWith(42, expect.any(AbortSignal))
    expect(container.querySelector('[data-shell="store"]')).toBeInTheDocument()
  })

  it.each([
    ['/', 'Encontre produtos para o seu dia a dia'],
    ['/carrinho', 'Carrinho'],
    ['/checkout', 'Checkout'],
    ['/pedido-confirmado/7', 'Pedido confirmado'],
    ['/pedidos', 'Pedidos'],
    ['/pedidos/7', 'Detalhes do pedido'],
  ])('renders the store route %s', (route, heading) => {
    const { container } = renderApp(route)

    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument()
    expect(container.querySelector('[data-shell="store"]')).toBeInTheDocument()
  })

  it.each([
    ['/entrar', 'Entrar na sua conta'],
    ['/cadastro', 'Cadastro de cliente'],
  ])('renders the public route %s', (route, heading) => {
    const { container } = renderApp(route)

    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument()
    expect(container.querySelector('[data-shell="public"]')).toBeInTheDocument()
  })

  it('renders the not found page with a return to the catalog', () => {
    const { container } = renderApp('/rota-inexistente')

    expect(screen.getByRole('heading', { level: 1, name: 'Página não encontrada' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar ao catálogo' })).toHaveAttribute('href', '/')
    expect(container.querySelector('[data-shell="public"]')).toBeInTheDocument()
  })

  it.each([
    ['/minha-conta/dados', 'Dados pessoais'],
    ['/minha-conta/senha', 'Alterar senha'],
  ])('nests the account route %s inside the store shell', (route, heading) => {
    const { container } = renderApp(route)

    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument()
    expect(container.querySelector('[data-shell="store"]')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Minha conta' })).toBeInTheDocument()
  })
})
