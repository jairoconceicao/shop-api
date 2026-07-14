import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import type { CatalogProduct } from '../contracts/catalog'
import { ProductCard } from './ProductCard'

const product: CatalogProduct = {
  id: 42,
  title: 'Teclado mecânico ABNT2',
  thumbnail: '/teclado.webp',
  price: 349.9,
  stock: 1,
  category: { id: 12, title: 'Hardware' },
}

function LocationProbe() {
  const location = useLocation()
  return <output aria-label="Localização atual">{location.pathname}</output>
}

function renderCard(candidate: CatalogProduct = product) {
  return render(
    <MemoryRouter initialEntries={['/produtos']}>
      <ProductCard product={candidate} />
      <LocationProbe />
    </MemoryRouter>,
  )
}

describe('ProductCard', () => {
  it('renders only catalog content with a BRL price and accessible image', () => {
    renderCard()

    expect(screen.getByText('Hardware')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Teclado mecânico ABNT2' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: 'Teclado mecânico ABNT2' }),
    ).toHaveAttribute('src', '/teclado.webp')
    expect(screen.getByText('R$ 349,90')).toBeInTheDocument()
    expect(screen.getByRole('article')).toHaveClass('min-w-0')

    for (const excludedCopy of [
      /comprar/i,
      /quantidade/i,
      /avaliação/i,
      /promoção/i,
      /preço anterior/i,
      /pix/i,
      /parcelamento/i,
      /frete/i,
      /modelo/i,
      /descrição/i,
      /sku/i,
    ]) {
      expect(screen.queryByText(excludedCopy)).not.toBeInTheDocument()
    }
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it.each([
    { stock: 1, label: 'Em estoque' },
    { stock: 0, label: 'Esgotado' },
    { stock: -0.1, label: 'Esgotado' },
  ])('derives $label when stock is $stock', ({ stock, label }) => {
    renderCard({ ...product, stock })

    expect(screen.getByRole('status', { name: label })).toHaveTextContent(label)
  })

  it('delegates an absent thumbnail to the accessible image fallback', () => {
    renderCard({ ...product, thumbnail: null })

    expect(
      screen.getByRole('img', { name: 'Teclado mecânico ABNT2' }),
    ).toHaveTextContent('Imagem indisponível')
  })

  it('delegates a failed thumbnail to the accessible image fallback', () => {
    renderCard()

    fireEvent.error(
      screen.getByRole('img', { name: 'Teclado mecânico ABNT2' }),
    )

    expect(
      screen.getByRole('img', { name: 'Teclado mecânico ABNT2' }),
    ).toHaveTextContent('Imagem indisponível')
  })

  it('navigates through the explicit accessible details link without reload', () => {
    renderCard()

    const link = screen.getByRole('link', { name: 'Ver detalhes' })
    expect(link).toHaveAttribute('href', '/produtos/42')

    fireEvent.click(link)

    expect(screen.getByLabelText('Localização atual')).toHaveTextContent(
      '/produtos/42',
    )
  })
})
