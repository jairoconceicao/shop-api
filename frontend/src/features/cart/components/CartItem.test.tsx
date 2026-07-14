import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import type { CartItem as CartItemContract } from '../contracts/cart'
import type { CartProductResult } from '../queries/useCartProductsQuery'
import { CartItem } from './CartItem'

const item: CartItemContract = {
  id: 7,
  productId: 42,
  quantity: 2,
  unitPrice: 349.9,
}

const productResult: CartProductResult = {
  status: 'success',
  productId: 42,
  product: {
    id: 42,
    title: 'Teclado mecânico ABNT2',
    description: null,
    model: null,
    photo: '/teclado.webp',
    price: 999.99,
    stock: 3,
    category: { id: 12, title: 'Hardware' },
  },
}

function renderItem(result: CartProductResult = productResult) {
  return render(
    <MemoryRouter>
      <CartItem
        actions={<button type="button">Remover</button>}
        fallbackAction={<button type="button">Tentar novamente</button>}
        item={item}
        productResult={result}
        quantityControl={<button type="button">Alterar quantidade</button>}
      />
    </MemoryRouter>,
  )
}

describe('CartItem', () => {
  it('renders enriched product identity and exposes the product details link', () => {
    renderItem()

    expect(screen.getByRole('article')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Teclado mecânico ABNT2' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: 'Teclado mecânico ABNT2' }),
    ).toHaveAttribute('src', '/teclado.webp')
    expect(screen.getByRole('link', { name: 'Teclado mecânico ABNT2' }))
      .toHaveAttribute('href', '/produtos/42')
    expect(screen.getByRole('button', { name: 'Alterar quantidade' }))
      .toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remover' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tentar novamente' }))
      .not.toBeInTheDocument()
  })

  it('uses only the cart snapshot for all financial values', () => {
    renderItem()

    expect(screen.getByText('Preço unitário').nextElementSibling).toHaveTextContent(
      'R$ 349,90',
    )
    expect(screen.getByText('Quantidade').nextElementSibling).toHaveTextContent('2')
    expect(screen.getByText('Subtotal').nextElementSibling).toHaveTextContent(
      'R$ 699,80',
    )
    expect(screen.queryByText('R$ 999,99')).not.toBeInTheDocument()
  })

  it('keeps cart data and actionable fallback content when enrichment fails', () => {
    const onRemove = vi.fn()
    const onRetry = vi.fn()

    render(
      <MemoryRouter>
        <CartItem
          actions={<button onClick={onRemove} type="button">Remover</button>}
          fallbackAction={(
            <button onClick={onRetry} type="button">Tentar novamente</button>
          )}
          item={item}
          productResult={{
            status: 'error',
            productId: 42,
            error: new Error('sensitive upstream failure'),
          }}
          quantityControl={<button type="button">Alterar quantidade</button>}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Produto 42' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Produto 42' })).toHaveTextContent(
      'Imagem indisponível',
    )
    expect(screen.getByRole('link', { name: 'Produto 42' })).toHaveAttribute(
      'href',
      '/produtos/42',
    )
    expect(screen.getByRole('button', { name: 'Tentar novamente' }))
      .toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Remover' }))
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(onRemove).toHaveBeenCalledOnce()
    expect(onRetry).toHaveBeenCalledOnce()
    expect(screen.getByText('R$ 349,90')).toBeInTheDocument()
    expect(screen.getByText('R$ 699,80')).toBeInTheDocument()
    expect(screen.queryByText(/sensitive upstream failure/i)).not.toBeInTheDocument()
  })
})
