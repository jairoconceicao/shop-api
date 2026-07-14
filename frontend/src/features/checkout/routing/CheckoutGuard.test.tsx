import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Cart } from '../../cart/contracts/cart'
import { CheckoutGuard } from './CheckoutGuard'

const cartQuery: {
  data?: Cart
  hasCart: boolean
  isError: boolean
  isPending: boolean
} = {
  hasCart: true,
  isError: false,
  isPending: false,
}

vi.mock('../../cart/queries/useCartQuery', () => ({ useCartQuery: () => cartQuery }))

function renderGuard() {
  return render(
    <MemoryRouter initialEntries={['/checkout']}>
      <Routes>
        <Route element={<CheckoutGuard />}>
          <Route path="checkout" element={<h1>Formulário de checkout</h1>} />
        </Route>
        <Route path="carrinho" element={<h1>Carrinho</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('CheckoutGuard', () => {
  beforeEach(() => {
    cartQuery.data = undefined
    cartQuery.hasCart = true
    cartQuery.isError = false
    cartQuery.isPending = false
  })

  it('exibe carregamento sem liberar o checkout enquanto aguarda o carrinho confirmado', () => {
    cartQuery.isPending = true

    renderGuard()

    expect(screen.getByRole('status')).toHaveTextContent('Carregando carrinho')
    expect(screen.queryByRole('heading', { name: 'Formulário de checkout' })).not.toBeInTheDocument()
  })

  it('exibe erro sem liberar o checkout quando a consulta falha', () => {
    cartQuery.isError = true

    renderGuard()

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar o carrinho')
    expect(screen.queryByRole('heading', { name: 'Formulário de checkout' })).not.toBeInTheDocument()
  })

  it.each([
    ['não existe associação de carrinho', false, undefined],
    ['o carrinho confirmado está ausente', true, undefined],
    ['o carrinho confirmado está vazio', true, { customerId: 1, id: 2, createdAt: '2026-07-14T12:00:00Z', items: [] }],
  ])('redireciona para o carrinho quando %s', (_scenario, hasCart, data) => {
    cartQuery.hasCart = hasCart
    cartQuery.data = data

    renderGuard()

    expect(screen.getByRole('heading', { name: 'Carrinho' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Formulário de checkout' })).not.toBeInTheDocument()
  })

  it('libera o checkout quando o carrinho confirmado contém itens', () => {
    cartQuery.data = {
      customerId: 1,
      id: 2,
      createdAt: '2026-07-14T12:00:00Z',
      items: [{ id: 3, productId: 4, quantity: 1, unitPrice: 99.9 }],
    }

    renderGuard()

    expect(screen.getByRole('heading', { name: 'Formulário de checkout' })).toBeInTheDocument()
  })
})
