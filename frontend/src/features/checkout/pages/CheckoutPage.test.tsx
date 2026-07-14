import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { HttpResponse, http } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { server } from '../../../shared/testing/server'
import { useAuthStore } from '../../auth/store/authStore'
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
  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com')
    useAuthStore.setState({ session: {
      token: 'access-token', tipo: 'Cliente', expiraEm: '2099-01-01T00:00:00Z',
      usuarioId: 4, clienteId: 7, email: 'cliente@exemplo.com',
    } })
  })

  function renderPage() {
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    return render(
      <QueryClientProvider client={client}>
        <CheckoutPage cart={cart} profile={profile} />
      </QueryClientProvider>,
    )
  }

  it('renders the cached address, cart totals, and exactly the supported payment methods', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'Checkout' })).toBeInTheDocument()
    expect(screen.getByLabelText('Logradouro')).toHaveValue('Rua das Flores')
    expect(screen.getAllByText('R$ 100,00')).toHaveLength(2)
    expect(screen.getAllByRole('radio').map((radio) => radio.getAttribute('value')))
      .toEqual(['Pix', 'Cartao', 'Boleto'])
  })

  it('keeps address edits local and focuses the actionable summary after invalid submit', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    renderPage()

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
    renderPage()

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

    const client = new QueryClient()
    render(
      <QueryClientProvider client={client}><MemoryRouter initialEntries={['/checkout']}>
        <Routes>
          <Route element={<ContextRoute />}>
            <Route path="checkout" element={<CheckoutPage />} />
          </Route>
        </Routes>
      </MemoryRouter></QueryClientProvider>,
    )

    expect(screen.getByLabelText('Logradouro')).toHaveValue('Rua das Flores')
    expect(screen.getAllByText('R$ 100,00')).toHaveLength(2)
  })

  it('applies the wide grid span to the field wrapper', () => {
    renderPage()

    expect(screen.getByLabelText('Logradouro').parentElement).toHaveClass('sm:col-span-2')
    expect(screen.getByLabelText('Logradouro')).not.toHaveClass('sm:col-span-2')
  })

  it('sends only one order while a double confirmation is pending and disables the CTA', async () => {
    let release!: () => void
    let requests = 0
    server.use(http.post('*/api/v1/pedido', async () => {
      requests += 1
      await new Promise<void>((resolve) => { release = resolve })
      return HttpResponse.json({ status: true, data: {
        pedidoId: 99, clienteId: 7, dataPedido: '2026-07-14T14:00:00Z',
        formaPagamento: 'Pix', status: 'Criado', valorTotal: 100,
      } }, { status: 201 })
    }))
    renderPage()

    const button = screen.getByRole('button', { name: 'Confirmar pedido' })
    fireEvent.click(button)
    fireEvent.click(button)

    await waitFor(() => expect(button).toBeDisabled())
    expect(requests).toBe(1)
    release()
    await waitFor(() => expect(button).not.toBeDisabled())
  })

  it.each([
    [409, 'Revise o carrinho antes de tentar novamente.'],
    [422, 'Revise os dados do pedido e tente novamente.'],
  ])('shows actionable feedback for HTTP %s and preserves edits', async (status, expected) => {
    server.use(http.post('*/api/v1/pedido', () => HttpResponse.json({
      error: { message: 'Mensagem técnica da API.' },
    }, { status })))
    renderPage()
    const street = screen.getByLabelText('Logradouro')
    fireEvent.change(street, { target: { value: 'Rua editada' } })

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pedido' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(expected)
    expect(street).toHaveValue('Rua editada')
    expect(screen.getByRole('button', { name: 'Confirmar pedido' })).not.toBeDisabled()
  })

  it('shows safe generic feedback for other creation failures', async () => {
    server.use(http.post('*/api/v1/pedido', () => HttpResponse.json({
      error: { message: 'Detalhes internos.' },
    }, { status: 500 })))
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pedido' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Tente confirmar novamente. Se o problema continuar, volte ao carrinho.',
    )
    expect(screen.queryByText('Detalhes internos.')).not.toBeInTheDocument()
  })
})
