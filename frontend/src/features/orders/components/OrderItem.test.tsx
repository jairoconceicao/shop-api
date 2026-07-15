import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { OrderItem } from './OrderItem'

const item = { itemId: 8, productId: 3, quantity: 2, unitPrice: 12.5 }

function renderItem(productResult: React.ComponentProps<typeof OrderItem>['productResult']) {
  render(<MemoryRouter><OrderItem item={item} productResult={productResult} /></MemoryRouter>)
}

describe('OrderItem', () => {
  it('does not report an unavailable product while hydration is pending', () => {
    renderItem({ status: 'pending', productId: 3 })

    expect(screen.getByText('Carregando produto…')).toBeInTheDocument()
    expect(screen.queryByText('Produto indisponível')).not.toBeInTheDocument()
    expect(screen.getByText('Quantidade: 2')).toBeInTheDocument()
  })

  it('renders hydrated product title and image with confirmed order values', () => {
    renderItem({
      status: 'success',
      productId: 3,
      product: {
        id: 3,
        title: 'Teclado mecânico',
        photo: '/teclado.webp',
        description: null,
        model: null,
        price: 99,
        stock: 4,
        category: { id: 1, title: 'Periféricos' },
      },
    })

    expect(screen.getByRole('link', { name: 'Teclado mecânico' })).toHaveAttribute('href', '/produtos/3')
    expect(screen.getByRole('img', { name: 'Teclado mecânico' })).toHaveAttribute('src', '/teclado.webp')
    expect(screen.getByText('Quantidade: 2')).toBeInTheDocument()
    expect(screen.getByText('R$ 25,00')).toBeInTheDocument()
  })

  it('keeps a failed product isolated and its confirmed values visible', () => {
    renderItem({ status: 'error', productId: 3, error: new Error('gone') })

    expect(screen.getByText('Produto indisponível')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Produto indisponível' })).toBeInTheDocument()
    expect(screen.getByText('Quantidade: 2')).toBeInTheDocument()
    expect(screen.getByText('R$ 12,50 cada')).toBeInTheDocument()
    expect(screen.getByText('R$ 25,00')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver produto' })).toHaveAttribute('href', '/produtos/3')
  })
})
