import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Cart } from '../contracts/cart'
import { CartPage } from './CartPage'

const { cartQuery, productsQuery, useCartProductsQuery } = vi.hoisted(() => ({
  cartQuery: {
    data: undefined as Cart | undefined,
    hasCart: false,
    isError: false,
    isPending: false,
    refetch: vi.fn(),
  },
  productsQuery: {
    data: [] as Array<Record<string, unknown>>,
    isPending: false,
    refetch: vi.fn(),
  },
  useCartProductsQuery: vi.fn(),
}))

vi.mock('../queries/useCartQuery', () => ({ useCartQuery: () => cartQuery }))
vi.mock('../queries/useCartProductsQuery', () => ({
  useCartProductsQuery: (items: unknown[]) => useCartProductsQuery(items),
}))

const cart: Cart = {
  customerId: 20,
  id: 900,
  createdAt: '2026-07-14T12:00:00Z',
  items: [
    { id: 8, productId: 2, quantity: 2, unitPrice: 125.5 },
    { id: 7, productId: 1, quantity: 1, unitPrice: 49.9 },
  ],
}

function product(productId: number, title: string) {
  return {
    status: 'success',
    productId,
    product: {
      id: productId,
      title,
      description: null,
      model: null,
      photo: null,
      price: 9999,
      stock: 10,
      category: { id: 3, title: 'Categoria' },
    },
  }
}

function renderPage() {
  return render(<MemoryRouter><CartPage /></MemoryRouter>)
}

describe('CartPage', () => {
  beforeEach(() => {
    Object.assign(cartQuery, {
      data: undefined,
      hasCart: false,
      isError: false,
      isPending: false,
    })
    Object.assign(productsQuery, { data: [], isPending: false })
    cartQuery.refetch.mockReset()
    productsQuery.refetch.mockReset()
    useCartProductsQuery.mockReset().mockReturnValue(productsQuery)
  })

  it('shows the empty state without a cart association and still calls hydration at the top level', () => {
    renderPage()

    expect(useCartProductsQuery).toHaveBeenCalledWith([])
    expect(screen.getByRole('heading', { level: 1, name: 'Carrinho' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Seu carrinho está vazio' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Explorar catálogo' })).toHaveAttribute('href', '/')
  })

  it('renders an accessible loading status while the confirmed cart is pending', () => {
    Object.assign(cartQuery, { hasCart: true, isPending: true })

    renderPage()

    expect(screen.getByRole('status')).toHaveTextContent('Carregando carrinho')
    expect(screen.getAllByTestId('cart-item-skeleton')).toHaveLength(2)
  })

  it('renders a recoverable error that manually retries the cart query', () => {
    Object.assign(cartQuery, { hasCart: true, isError: true })

    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(cartQuery.refetch).toHaveBeenCalledOnce()
  })

  it('keeps remote item order and calculates subtotal and total only from cart snapshots', () => {
    Object.assign(cartQuery, { data: cart, hasCart: true })
    productsQuery.data = [product(1, 'Primeiro produto'), product(2, 'Segundo produto')]

    renderPage()

    const list = screen.getByRole('list', { name: 'Itens do carrinho' })
    const items = within(list).getAllByRole('listitem')
    expect(within(items[0]).getByRole('heading', { name: 'Segundo produto' })).toBeInTheDocument()
    expect(within(items[1]).getByRole('heading', { name: 'Primeiro produto' })).toBeInTheDocument()

    const summary = screen.getByRole('complementary', { name: 'Resumo do carrinho' })
    expect(within(summary).getByText('Subtotal').nextElementSibling).toHaveTextContent('R$ 300,90')
    expect(within(summary).getByText('Total').nextElementSibling).toHaveTextContent('R$ 300,90')
    expect(within(summary).queryByText(/frete|desconto/i)).not.toBeInTheDocument()
    expect(screen.queryByText('R$ 9.999,00')).not.toBeInTheDocument()
  })

  it('keeps failed product hydration actionable without hiding successful items', () => {
    Object.assign(cartQuery, { data: cart, hasCart: true })
    productsQuery.data = [
      product(1, 'Produto disponível'),
      { status: 'error', productId: 2, error: new Error('private upstream detail') },
    ]

    renderPage()

    expect(screen.getByRole('heading', { name: 'Produto 2' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Produto disponível' })).toBeInTheDocument()
    expect(screen.queryByText(/private upstream detail/i)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Tentar carregar Produto 2 novamente' }))
    expect(productsQuery.refetch).toHaveBeenCalledOnce()
  })

  it('shows the empty state when the confirmed cart has no items', () => {
    Object.assign(cartQuery, { data: { ...cart, items: [] }, hasCart: true })

    renderPage()

    expect(screen.getByRole('heading', { name: 'Seu carrinho está vazio' })).toBeInTheDocument()
  })
})
