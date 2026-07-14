import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { Footer } from './Footer'

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  )
}

describe('Footer', () => {
  it('oferece somente destinos disponíveis no MVP', () => {
    renderFooter()

    const navigation = screen.getByRole('navigation', { name: 'Navegação do rodapé' })
    expect(within(navigation).getByRole('link', { name: 'Catálogo' })).toHaveAttribute('href', '/')
    expect(within(navigation).getByRole('link', { name: 'Carrinho' })).toHaveAttribute(
      'href',
      '/carrinho',
    )
    expect(within(navigation).getByRole('link', { name: 'Meus pedidos' })).toHaveAttribute(
      'href',
      '/pedidos',
    )
    expect(within(navigation).getByRole('link', { name: 'Minha conta' })).toHaveAttribute(
      'href',
      '/minha-conta/dados',
    )
    expect(within(navigation).getAllByRole('link')).toHaveLength(4)
  })

  it('exibe somente informações sustentadas pelo MVP', () => {
    renderFooter()

    const paymentMethods = screen.getByRole('region', { name: 'Formas de pagamento' })
    expect(within(paymentMethods).getAllByRole('listitem')).toHaveLength(3)
    expect(within(paymentMethods).getByText('Pix')).toBeInTheDocument()
    expect(within(paymentMethods).getByText('Cartão')).toBeInTheDocument()
    expect(within(paymentMethods).getByText('Boleto')).toBeInTheDocument()

    expect(screen.queryByText(/entrega rápida|melhores preços|visa|master/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /sobre nós|privacidade|termos|ajuda/i })).not.toBeInTheDocument()
  })
})
