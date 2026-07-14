import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

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

  it('keeps address edits local and focuses the actionable summary after invalid submit', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    render(<CheckoutPage cart={cart} profile={profile} />)

    const street = screen.getByLabelText('Logradouro')
    fireEvent.change(street, { target: { value: 'Rua editada apenas no pedido' } })
    expect(street).toHaveValue('Rua editada apenas no pedido')
    expect(profile.address.logradouro).toBe('Rua das Flores')
    fireEvent.change(street, { target: { value: '' } })
    fireEvent.change(screen.getByLabelText('UF'), { target: { value: 'S' } })
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pedido' }))

    const summary = await screen.findByRole('alert')
    expect(summary).toHaveTextContent('Revise os campos destacados')
    await waitFor(() => expect(summary).toHaveFocus())
    expect(screen.getByLabelText('Logradouro')).toHaveAccessibleDescription('Informe o logradouro.')
    expect(screen.getByRole('link', { name: 'Informe o logradouro.' }))
      .toHaveAttribute('href', '#checkout-logradouro')
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })

  it('allows selecting every supported payment without creating an order', () => {
    render(<CheckoutPage cart={cart} profile={profile} />)

    for (const name of ['Pix', 'Cartão', 'Boleto']) {
      const payment = screen.getByRole('radio', { name })
      fireEvent.click(payment)
      expect(payment).toBeChecked()
    }
  })

  it('consumes the cart and profile delivered by the outlet context', () => {
    function ContextRoute() {
      return <Outlet context={{ cart, profile }} />
    }

    render(
      <MemoryRouter initialEntries={['/checkout']}>
        <Routes>
          <Route element={<ContextRoute />}>
            <Route path="checkout" element={<CheckoutPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByLabelText('Logradouro')).toHaveValue('Rua das Flores')
    expect(screen.getAllByText('R$ 100,00')).toHaveLength(2)
  })

  it('applies the wide grid span to the field wrapper', () => {
    render(<CheckoutPage cart={cart} profile={profile} />)

    expect(screen.getByLabelText('Logradouro').parentElement).toHaveClass('sm:col-span-2')
    expect(screen.getByLabelText('Logradouro')).not.toHaveClass('sm:col-span-2')
  })
})
