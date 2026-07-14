import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { MemoryRouter, Route, Routes, useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AppError } from '../../../shared/errors/appError'
import { useAuthStore } from '../../auth/store/authStore'
import { ProductDetailPage } from './ProductDetailPage'

const { fetchProductDetail } = vi.hoisted(() => ({ fetchProductDetail: vi.fn() }))
vi.mock('../services/productDetailService', () => ({ fetchProductDetail }))

const product = {
  id: 42,
  title: 'Notebook Pro 14',
  description: 'Notebook leve para trabalho e estudo.',
  model: 'NP14-2026',
  photo: 'https://example.com/notebook.jpg',
  price: 5299.9,
  stock: 7,
  category: { id: 3, title: 'Informática' },
}

function renderPage(route = '/produtos/42') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}><MemoryRouter initialEntries={[route]}>{children}</MemoryRouter></QueryClientProvider>
  }
  return {
    ...render(
      <Routes>
        <Route path="produtos/:produtoId" element={<ProductDetailPage />} />
        <Route path="entrar" element={<LoginDestination />} />
      </Routes>,
      { wrapper: Wrapper },
    ),
    queryClient,
  }
}

function LoginDestination() {
  const location = useLocation()
  const navigationType = useNavigationType()

  return <p data-testid="login-destination">{JSON.stringify({ location, navigationType })}</p>
}

function ProductNavigation() {
  const navigate = useNavigate()

  return <button onClick={() => void navigate('/produtos/43')}>Próximo produto</button>
}

function renderNavigablePage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return {
    ...render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/produtos/42']}>
          <ProductNavigation />
          <Routes><Route path="produtos/:produtoId" element={<ProductDetailPage />} /></Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    ),
    queryClient,
  }
}

beforeEach(() => {
  useAuthStore.getState().clearSession()
  fetchProductDetail.mockReset()
  fetchProductDetail.mockResolvedValue(product)
})

describe('ProductDetailPage', () => {
  it('renders only the supported product fields in a responsive detail layout', async () => {
    const { container } = renderPage()

    expect(await screen.findByRole('heading', { level: 1, name: product.title })).toBeInTheDocument()
    expect(screen.getByText('Informática')).toBeInTheDocument()
    expect(screen.getByText('NP14-2026')).toBeInTheDocument()
    expect(screen.getByText(product.description)).toBeInTheDocument()
    expect(screen.getByRole('img', { name: product.title })).toHaveAttribute('src', product.photo)
    expect(screen.getByText('R$ 5.299,90')).toBeInTheDocument()
    expect(screen.getByText('7 unidades em estoque')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="product-detail-grid"]')).toHaveClass('grid', 'lg:grid-cols-2')
    expect(container.querySelector('[data-testid="product-description"]')).not.toBeNull()
    expect(document.body).not.toHaveTextContent(/avaliaç|galeria|desconto|pix|parcel|frete|vantagens|especificações|relacionados|comprar agora/i)
    expect(screen.getByRole('spinbutton', { name: 'Quantidade' })).toHaveValue(1)
    expect(screen.getByRole('button', { name: 'Adicionar ao carrinho' })).toBeEnabled()
  })

  it('sends a visitor to login with the exact current URL and no persisted purchase data', async () => {
    renderPage('/produtos/42?origem=catalogo#comprar')

    fireEvent.click(await screen.findByRole('button', { name: 'Adicionar ao carrinho' }))

    const destination = JSON.parse(screen.getByTestId('login-destination').textContent ?? '')
    expect(destination.navigationType).toBe('REPLACE')
    expect(destination.location).toMatchObject({ pathname: '/entrar', search: '', hash: '' })
    expect(destination.location.state).toEqual({
      returnTo: '/produtos/42?origem=catalogo#comprar',
    })
    expect(localStorage).toHaveLength(0)
    expect(sessionStorage).toHaveLength(0)
    expect(fetchProductDetail).toHaveBeenCalledTimes(1)
  })

  it('sends an expired session to login before any cart behavior', async () => {
    useAuthStore.getState().setSession({
      token: 'expired-token',
      tipo: 'Bearer',
      expiraEm: '2000-01-01T00:00:00.000Z',
      usuarioId: 10,
      clienteId: 20,
      email: 'cliente@exemplo.com',
    }, 'session')
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Adicionar ao carrinho' }))

    const destination = JSON.parse(screen.getByTestId('login-destination').textContent ?? '')
    expect(destination.navigationType).toBe('REPLACE')
    expect(destination.location).toMatchObject({ pathname: '/entrar' })
    expect(destination.location.state).toEqual({ returnTo: '/produtos/42' })
    expect(fetchProductDetail).toHaveBeenCalledTimes(1)
  })

  it('keeps an authenticated customer on the product without cart side effects', async () => {
    useAuthStore.getState().setSession({
      token: 'valid-token',
      tipo: 'Bearer',
      expiraEm: '2999-01-01T00:00:00.000Z',
      usuarioId: 10,
      clienteId: 20,
      email: 'cliente@exemplo.com',
    }, 'session')
    renderPage('/produtos/42?origem=catalogo#comprar')

    fireEvent.click(await screen.findByRole('button', { name: 'Adicionar ao carrinho' }))

    expect(screen.getByRole('heading', { name: product.title })).toBeInTheDocument()
    expect(screen.queryByTestId('login-destination')).not.toBeInTheDocument()
    expect(fetchProductDetail).toHaveBeenCalledTimes(1)
  })

  it('renders neutral fallbacks for nullable fields', async () => {
    fetchProductDetail.mockResolvedValue({ ...product, description: null, model: null, photo: null })
    renderPage()

    expect(await screen.findByText('Não informado')).toBeInTheDocument()
    expect(screen.getByText('Descrição não disponível.')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: product.title })).toHaveTextContent('Imagem indisponível')
  })

  it('shows a geometry-stable skeleton only for the initial pending request', () => {
    fetchProductDetail.mockReturnValue(new Promise(() => undefined))
    const { container } = renderPage()

    expect(screen.getByTestId('product-detail-skeleton')).toHaveClass('container-page')
    expect(container.querySelector('[data-testid="product-detail-skeleton-grid"]')).toHaveClass('grid', 'lg:grid-cols-2')
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('retries a recoverable failure', async () => {
    fetchProductDetail.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(product)
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Tentar novamente' }))
    expect(await screen.findByRole('heading', { level: 1, name: product.title })).toBeInTheDocument()
    expect(fetchProductDetail).toHaveBeenCalledTimes(2)
  })

  it('shows a specific not-found state for a 404 without retry', async () => {
    fetchProductDetail.mockRejectedValue(new AppError({ kind: 'http', status: 404, message: 'ausente' }))
    renderPage()

    expect(await screen.findByText('Produto não encontrado')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar ao catálogo' })).toHaveAttribute('href', '/')
    expect(screen.queryByRole('button', { name: 'Tentar novamente' })).not.toBeInTheDocument()
  })

  it.each(['/produtos/0', '/produtos/abc'])('does not request an invalid product id at %s', async (route) => {
    renderPage(route)

    expect(await screen.findByText('Produto não encontrado')).toBeInTheDocument()
    expect(fetchProductDetail).not.toHaveBeenCalled()
  })

  it('keeps product data visible during a background refetch', async () => {
    fetchProductDetail.mockResolvedValueOnce(product).mockReturnValueOnce(new Promise(() => undefined))
    const { queryClient } = renderPage()
    expect(await screen.findByRole('heading', { name: product.title })).toBeInTheDocument()

    void queryClient.invalidateQueries({ queryKey: ['catalog', 'products', 'detail', 42] })
    await waitFor(() => expect(fetchProductDetail).toHaveBeenCalledTimes(2))
    expect(screen.getByRole('heading', { name: product.title })).toBeInTheDocument()
    expect(screen.queryByTestId('product-detail-skeleton')).not.toBeInTheDocument()
  })

  it('limits the quantity to the available whole stock', async () => {
    fetchProductDetail.mockResolvedValue({ ...product, stock: 3.9 })
    renderPage()

    const input = await screen.findByRole('spinbutton', { name: 'Quantidade' })
    expect(input).toHaveAttribute('min', '1')
    expect(input).toHaveAttribute('max', '3')

    fireEvent.click(screen.getByRole('button', { name: 'Aumentar quantidade' }))
    expect(input).toHaveValue(2)
    fireEvent.change(input, { target: { value: '9' } })
    expect(input).toHaveValue(3)
  })

  it.each([
    ['zero', 0],
    ['negative', -2],
    ['NaN', Number.NaN],
    ['positive infinity', Number.POSITIVE_INFINITY],
  ])('renders %s stock as sold out with disabled controls', async (_case, stock) => {
    fetchProductDetail.mockResolvedValue({ ...product, stock })
    renderPage()

    expect(await screen.findByText('Esgotado')).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: 'Quantidade' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Diminuir quantidade' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Aumentar quantidade' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Adicionar ao carrinho' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar ao carrinho' }))
    expect(screen.queryByTestId('login-destination')).not.toBeInTheDocument()
  })

  it('preserves quantity on refetch and clamps it when stock decreases', async () => {
    let resolveRefetch!: (value: typeof product) => void
    const refetchResult = new Promise<typeof product>((resolve) => {
      resolveRefetch = resolve
    })
    fetchProductDetail
      .mockResolvedValueOnce(product)
      .mockReturnValueOnce(refetchResult)
      .mockResolvedValueOnce({ ...product, stock: 0 })
      .mockResolvedValueOnce({ ...product, stock: 6 })
    const { queryClient } = renderPage()
    const input = await screen.findByRole('spinbutton', { name: 'Quantidade' })

    fireEvent.change(input, { target: { value: '5' } })
    expect(input).toHaveValue(5)

    void queryClient.invalidateQueries({ queryKey: ['catalog', 'products', 'detail', 42] })
    await waitFor(() => expect(fetchProductDetail).toHaveBeenCalledTimes(2))
    expect(input).toHaveValue(5)

    resolveRefetch({ ...product, stock: 2 })
    await waitFor(() => expect(input).toHaveValue(2))

    await queryClient.invalidateQueries({ queryKey: ['catalog', 'products', 'detail', 42] })
    await waitFor(() => expect(screen.getByText('Esgotado')).toBeInTheDocument())
    expect(input).toHaveValue(1)
    expect(input).toBeDisabled()

    await queryClient.invalidateQueries({ queryKey: ['catalog', 'products', 'detail', 42] })
    await waitFor(() => expect(input).toBeEnabled())
    expect(input).toHaveValue(1)
  })

  it('resets quantity when the product changes', async () => {
    const nextProduct = { ...product, id: 43, title: 'Mouse Pro', stock: 4 }
    fetchProductDetail.mockImplementation((id: number) => Promise.resolve(id === 42 ? product : nextProduct))
    renderNavigablePage()

    const input = await screen.findByRole('spinbutton', { name: 'Quantidade' })
    fireEvent.change(input, { target: { value: '4' } })
    expect(input).toHaveValue(4)

    fireEvent.click(screen.getByRole('button', { name: 'Próximo produto' }))
    expect(await screen.findByRole('heading', { name: nextProduct.title })).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: 'Quantidade' })).toHaveValue(1)
  })
})
