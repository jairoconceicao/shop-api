import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import type { Order } from '../contracts/orders'
import { OrderCard } from './OrderCard'

function orderWith(overrides: Partial<Order> = {}): Order {
  return {
    id: 41,
    cartId: 12,
    customerId: 7,
    deliveryAddress: {
      logradouro: 'Rua das Flores',
      numero: '123',
      complemento: null,
      bairro: 'Centro',
      cidade: 'Sao Paulo',
      uf: 'SP',
      cep: '01001000',
    },
    createdAt: '2026-07-15T15:30:00Z',
    paymentMethod: 'Pix',
    status: 'EmProcessamento',
    items: [
      { itemId: 1, productId: 2, quantity: 2, unitPrice: 10.5 },
      { itemId: 2, productId: 3, quantity: 1, unitPrice: 4 },
    ],
    ...overrides,
  }
}

function renderCard(order = orderWith()) {
  return render(<MemoryRouter><OrderCard order={order} /></MemoryRouter>)
}

describe('OrderCard', () => {
  it('renders confirmed order presentation and navigates to its detail', () => {
    renderCard()

    expect(screen.getByRole('article', { name: 'Pedido 41' })).toBeInTheDocument()
    expect(screen.getByText('Em processamento')).toBeInTheDocument()
    expect(screen.getByText('R$ 25,00')).toBeInTheDocument()
    expect(screen.getByText('15/07/2026, 12:30')).toBeInTheDocument()
    expect(screen.getByText('Pix')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ver pedido 41/i })).toHaveAttribute('href', '/pedidos/41')
  })

  it('uses an accessible minimum target without unsupported commercial copy', () => {
    renderCard(orderWith({ items: [] }))

    const link = screen.getByRole('link', { name: /ver pedido 41/i })
    expect(link).toHaveClass('min-h-11')
    expect(screen.getByText('R$ 0,00')).toBeInTheDocument()
    expect(screen.queryByText(/frete|desconto|promoção/i)).not.toBeInTheDocument()
  })
})
