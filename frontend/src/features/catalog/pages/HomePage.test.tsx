import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { HomePage } from './HomePage'

describe('HomePage', () => {
  it('presents a neutral hero with a real link to the catalog section', () => {
    const { container } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Encontre produtos para o seu dia a dia' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Explorar catálogo' })).toHaveAttribute(
      'href',
      '#catalogo',
    )
    expect(container.querySelector('section#catalogo')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Catálogo' })).toBeInTheDocument()
  })

  it('does not present unsupported promotional claims', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(document.body).not.toHaveTextContent(
      /promoção|desconto|oferta|frete|entrega (?:rápida|grátis)|mais vendidos/i,
    )
  })
})
