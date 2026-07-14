import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AppError } from '../../../shared/errors/appError'
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
    ...render(<Routes><Route path="produtos/:produtoId" element={<ProductDetailPage />} /></Routes>, { wrapper: Wrapper }),
    queryClient,
  }
}

beforeEach(() => {
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
    expect(document.body).not.toHaveTextContent(/avaliaç|galeria|desconto|pix|parcel|frete|vantagens|especificações|relacionados|comprar|adicionar ao carrinho/i)
    expect(container.querySelector('input')).not.toBeInTheDocument()
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
})
