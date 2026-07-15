import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { useAuthStore } from '../../auth/store/authStore'
import type { CreatedOrder } from '../contracts/order'
import { setOrderConfirmation } from '../cache/orderConfirmationCache'
import { OrderConfirmationPage } from './OrderConfirmationPage'

const createdOrder: CreatedOrder = {
  id: 99,
  customerId: 7,
  createdAt: '2026-07-14T14:00:00Z',
  paymentMethod: 'Pix',
  status: 'Criado',
  total: 100,
}

function renderPage(
  path: string,
  { state, cache = false, customerId = 7 }: {
    state?: { createdOrder: CreatedOrder }
    cache?: boolean
    customerId?: number
  } = {},
) {
  const client = new QueryClient()
  if (cache) setOrderConfirmation(client, createdOrder)
  useAuthStore.setState({ session: {
    token: 'access-token', tipo: 'Cliente', expiraEm: '2099-01-01T00:00:00Z',
    usuarioId: 4, clienteId: customerId, email: 'cliente@exemplo.com',
  } })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[{ pathname: path, state }]}>
        <Routes>
          <Route path="pedido-confirmado/:pedidoId" element={<OrderConfirmationPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('OrderConfirmationPage', () => {
  it('shows only the confirmed response fields from the matching private cache', () => {
    renderPage('/pedido-confirmado/99', { cache: true })

    expect(screen.getByRole('heading', { name: 'Pedido criado' })).toBeInTheDocument()
    expect(screen.getByText('99')).toBeInTheDocument()
    expect(screen.getByText('14/07/2026, 11:00')).toBeInTheDocument()
    expect(screen.getByText('Pix')).toBeInTheDocument()
    expect(screen.getByText('Criado')).toBeInTheDocument()
    expect(screen.getByText('R$ 100,00')).toBeInTheDocument()
    expect(screen.queryByText(/autorizad|entrega|nota fiscal/i)).not.toBeInTheDocument()
  })

  it('supports the normal success path without navigation state', () => {
    renderPage('/pedido-confirmado/99', { cache: true })
    expect(screen.getByRole('heading', { name: 'Pedido criado' })).toBeInTheDocument()
  })

  it('ignores a created order injected into navigation history state', () => {
    renderPage('/pedido-confirmado/99', { state: { createdOrder } })

    expect(screen.getByRole('heading', { name: 'Confirmação indisponível' })).toBeInTheDocument()
    expect(screen.queryByText('R$ 100,00')).not.toBeInTheDocument()
  })

  it('does not show another customer snapshot', () => {
    renderPage('/pedido-confirmado/99', { cache: true, customerId: 8 })

    expect(screen.getByRole('heading', { name: 'Confirmação indisponível' })).toBeInTheDocument()
  })

  it.each([
    '/pedido-confirmado/99',
    '/pedido-confirmado/100',
    '/pedido-confirmado/invalido',
  ])('shows a safe unavailable state after refresh or mismatch: %s', (path) => {
    renderPage(path)

    expect(screen.getByRole('heading', { name: 'Confirmação indisponível' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar à loja' })).toHaveAttribute('href', '/')
    expect(screen.queryByText('R$ 100,00')).not.toBeInTheDocument()
  })
})
