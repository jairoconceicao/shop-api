import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

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

function renderPage(path: string, state?: { createdOrder: CreatedOrder }, cache = false) {
  const client = new QueryClient()
  if (cache) setOrderConfirmation(client, createdOrder)
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
  it('shows only the confirmed response fields when navigation state matches the route', () => {
    renderPage('/pedido-confirmado/99', { createdOrder })

    expect(screen.getByRole('heading', { name: 'Pedido criado' })).toBeInTheDocument()
    expect(screen.getByText('99')).toBeInTheDocument()
    expect(screen.getByText('14/07/2026, 11:00')).toBeInTheDocument()
    expect(screen.getByText('Pix')).toBeInTheDocument()
    expect(screen.getByText('Criado')).toBeInTheDocument()
    expect(screen.getByText('R$ 100,00')).toBeInTheDocument()
    expect(screen.queryByText(/autorizad|entrega|nota fiscal/i)).not.toBeInTheDocument()
  })

  it('reads the matching private memory snapshot when navigation state is absent', () => {
    renderPage('/pedido-confirmado/99', undefined, true)
    expect(screen.getByRole('heading', { name: 'Pedido criado' })).toBeInTheDocument()
  })

  it.each([
    ['/pedido-confirmado/99', undefined],
    ['/pedido-confirmado/100', { createdOrder }],
    ['/pedido-confirmado/invalido', { createdOrder }],
  ])('shows a safe unavailable state for absent or mismatched snapshot: %s', (path, state) => {
    renderPage(path, state)

    expect(screen.getByRole('heading', { name: 'Confirmação indisponível' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar à loja' })).toHaveAttribute('href', '/')
    expect(screen.queryByText('R$ 100,00')).not.toBeInTheDocument()
  })
})
