import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'
import { useAuthStore } from './features/auth/store/authStore'
import { cartQueryKeys } from './features/cart/queries/useCartQuery'
import { useCartSessionStore } from './features/cart/store/cartSessionStore'
import { server } from './shared/testing/server'

const { fetchProductDetail } = vi.hoisted(() => ({ fetchProductDetail: vi.fn() }))
vi.mock('./features/catalog/services/productDetailService', () => ({ fetchProductDetail }))

describe('App', () => {
  const queryClient = new QueryClient()

  function renderApp(route: string) {
    return render(
      <MemoryRouter initialEntries={[route]}>
        <QueryClientProvider client={queryClient}>
          <LocationProbe />
          <App />
        </QueryClientProvider>
      </MemoryRouter>,
    )
  }

  function LocationProbe() {
    const location = useLocation()

    return <output data-testid="current-location">{`${location.pathname}${location.search}${location.hash}`}</output>
  }

  beforeEach(() => {
    queryClient.clear()
    useCartSessionStore.setState({ cartIdsByCustomer: {} })
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

  afterEach(() => vi.unstubAllEnvs())

  it('returns from the real login flow to the exact product URL without adding automatically', async () => {
    let cartRequests = 0
    useAuthStore.getState().clearSession()
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com')
    server.use(
      http.post('https://api.example.com/api/v1/auth/login', () =>
        HttpResponse.json({
          status: true,
          data: {
            token: 'header.payload.signature',
            tipo: 'Bearer',
            expiraEm: '2099-01-01T00:00:00Z',
            usuarioId: 10,
            clienteId: 20,
            email: 'cliente@exemplo.com',
          },
        }),
      ),
      http.post('https://api.example.com/api/v1/carrinho/criar', () => {
        cartRequests += 1
        return HttpResponse.json({})
      }),
      http.post('https://api.example.com/api/v1/carrinho/items', () => {
        cartRequests += 1
        return HttpResponse.json({})
      }),
    )
    renderApp('/produtos/42?origem=catalogo#comprar')

    fireEvent.click(await screen.findByRole('button', { name: 'Adicionar ao carrinho' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Entrar na sua conta' })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'cliente@exemplo.com' },
    })
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'senha-secreta' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Notebook Pro 14' })).toBeInTheDocument()
    await waitFor(() => expect(useAuthStore.getState().session?.clienteId).toBe(20))
    expect(screen.getByTestId('current-location')).toHaveTextContent(
      '/produtos/42?origem=catalogo#comprar',
    )
    expect(cartRequests).toBe(0)
  })

  it.each([
    ['/', 'Encontre produtos para o seu dia a dia'],
    ['/pedido-confirmado/7', 'Confirmação do pedido'],
    ['/pedidos', 'Meus pedidos'],
  ])('renders the store route %s', async (route, heading) => {
    const { container } = renderApp(route)

    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument()
    expect(container.querySelector('[data-shell="store"]')).toBeInTheDocument()
  })

  it('renders the order detail store route with confirmed API data', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com')
    server.use(http.get('https://api.example.com/api/v1/pedido/7', () => HttpResponse.json({
      status: true,
      data: {
        pedidoId: 7, carrinhoId: 9, clienteId: 20, dataPedido: '2026-07-15T12:00:00Z',
        formaPagamento: 'Pix', status: 'Criado',
        enderecoEntrega: { logradouro: 'Rua A', numero: '10', complemento: null, cep: '12345678', bairro: 'Centro', cidade: 'São Paulo', uf: 'SP' },
        items: [{ itemId: 3, produtoId: 5, quantidade: 2, valorUnitario: 12.5 }],
      },
    })))

    const { container } = renderApp('/pedidos/7')

    expect(await screen.findByRole('heading', { level: 1, name: 'Pedido 7' })).toBeInTheDocument()
    expect(container.querySelector('[data-shell="store"]')).toBeInTheDocument()
  })

  it('preloads the customer address before rendering the checkout store route', async () => {
    let customerRequests = 0
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com')
    server.use(
      http.get('https://api.example.com/api/v1/cliente/20', ({ request }) => {
        customerRequests += 1
        expect(request.headers.get('Authorization')).toBe('Bearer header.payload.signature')

        return HttpResponse.json({
          status: true,
          data: {
            clienteId: 20,
            cpf: '12345678901',
            nome: 'Cliente',
            dataNascimento: '1990-01-01',
            email: 'cliente@exemplo.com',
            endereco: {
              logradouro: 'Rua A', numero: '10', complemento: null, cep: '12345678',
              bairro: 'Centro', cidade: 'Sao Paulo', uf: 'SP',
            },
            celular: { ddd: '11', numero: '999999999', whatsApp: true },
          },
        })
      }),
    )
    useCartSessionStore.setState({ cartIdsByCustomer: { '20': 30 } })
    queryClient.setQueryData(cartQueryKeys.detail(20, 30), {
      customerId: 20,
      id: 30,
      createdAt: '2026-07-14T12:00:00Z',
      items: [{ id: 40, productId: 50, quantity: 1, unitPrice: 99.9 }],
    })

    const { container } = renderApp('/checkout')

    expect(await screen.findByRole('heading', { level: 1, name: 'Checkout' })).toBeInTheDocument()
    expect(customerRequests).toBe(1)
    expect(container.querySelector('[data-shell="store"]')).toBeInTheDocument()
  })

  it('renders the real empty cart page in the protected store route', () => {
    const { container } = renderApp('/carrinho')

    expect(screen.getByRole('heading', { level: 1, name: 'Carrinho' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Seu carrinho está vazio' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Explorar catálogo' })).toHaveAttribute('href', '/')
    expect(container.querySelector('[data-shell="store"]')).toBeInTheDocument()
    expect(screen.getAllByRole('main')).toHaveLength(1)
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
    ['/minha-conta/dados', 'Carregando página de dados', 'status'],
    ['/minha-conta/senha', 'Carregando página de senha', 'status'],
  ])('nests the account route %s inside the store shell', (route, accessibleName, role) => {
    const { container } = renderApp(route)

    expect(screen.getByRole(role, { name: accessibleName })).toBeInTheDocument()
    expect(container.querySelector('[data-shell="store"]')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Minha conta' })).toBeInTheDocument()
  })
})
