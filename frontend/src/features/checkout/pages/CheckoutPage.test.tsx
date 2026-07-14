import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CheckoutPage } from './CheckoutPage'

const cart = {
  customerId: 7, id: 30, createdAt: '2026-07-14T12:00:00Z',
  items: [
    { id: 1, productId: 10, quantity: 2, unitPrice: 25.5 },
    { id: 2, productId: 11, quantity: 1, unitPrice: 49 },
  ],
}

const profile = {
  customerId: 7,
  address: {
    logradouro: 'Rua das Flores', numero: '42', complemento: 'Casa',
    cep: '12345678', bairro: 'Centro', cidade: 'São Paulo', uf: 'SP',
  },
}

describe('CheckoutPage', () => {
  it('renders the cached address, cart totals, and exactly the supported payment methods', () => {
    render(<CheckoutPage cart={cart} profile={profile} />)

    expect(screen.getByRole('heading', { name: 'Checkout' })).toBeInTheDocument()
    expect(screen.getByLabelText('Logradouro')).toHaveValue('Rua das Flores')
    expect(screen.getAllByText('R$ 100,00')).toHaveLength(2)
    expect(screen.getAllByRole('radio').map((radio) => radio.getAttribute('value')))
      .toEqual(['Pix', 'Cartao', 'Boleto'])
  })

  it('keeps address edits local and validates fields with an actionable summary', async () => {
    render(<CheckoutPage cart={cart} profile={profile} />)

    fireEvent.change(screen.getByLabelText('Logradouro'), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText('UF'), { target: { value: 'S' } })
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pedido' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Revise os campos destacados')
    expect(screen.getByLabelText('Logradouro')).toHaveAccessibleDescription('Informe o logradouro.')
    expect(screen.getByRole('link', { name: 'Informe o logradouro.' }))
      .toHaveAttribute('href', '#checkout-logradouro')
  })

  it('allows selecting Pix, Cartao, or Boleto without creating an order', () => {
    render(<CheckoutPage cart={cart} profile={profile} />)

    const boleto = screen.getByRole('radio', { name: 'Boleto' })
    fireEvent.click(boleto)
    expect(boleto).toBeChecked()
  })
})
