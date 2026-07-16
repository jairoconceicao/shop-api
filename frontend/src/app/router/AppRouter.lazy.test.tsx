import { render, screen } from '@testing-library/react'
import { MemoryRouter, Outlet } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { AppRouter } from './AppRouter'

vi.mock('../layouts/StoreLayout', () => ({ StoreLayout: Outlet }))
vi.mock('../layouts/PublicLayout', () => ({ PublicLayout: Outlet }))
vi.mock('../../features/auth/routing/ProtectedRoute', () => ({ ProtectedRoute: Outlet }))
vi.mock('../../features/checkout/routing/CheckoutGuard', () => ({ CheckoutGuard: Outlet }))
vi.mock('../../features/checkout/pages/CheckoutPage', () => ({
  CheckoutPage: () => <h1>Checkout carregado</h1>,
}))
vi.mock('../../features/checkout/pages/OrderConfirmationPage', () => ({
  OrderConfirmationPage: () => <h1>Confirmação carregada</h1>,
}))
vi.mock('../../features/customer/pages/CustomerDataPage', () => ({
  CustomerDataPage: () => <h1>Dados do cliente carregados</h1>,
}))
vi.mock('../../features/customer/pages/CustomerPasswordPage', () => ({
  CustomerPasswordPage: () => <h1>Troca de senha carregada</h1>,
}))
vi.mock('../../features/orders/pages/OrdersPage', () => ({
  OrdersPage: () => <h1>Meus pedidos</h1>,
}))
vi.mock('../../features/orders/pages/OrderDetailPage', () => ({
  OrderDetailPage: () => <h1>Pedido 41</h1>,
}))

describe('AppRouter lazy checkout routes', () => {
  it('shows an accessible fallback while loading checkout on demand', async () => {
    render(
      <MemoryRouter initialEntries={['/checkout']}>
        <AppRouter />
      </MemoryRouter>,
    )

    expect(screen.getByRole('status', { name: 'Carregando checkout' })).toHaveClass('min-h-96')
    expect(await screen.findByRole('heading', { name: 'Checkout carregado' })).toBeInTheDocument()
  })

  it('loads order confirmation with its own accessible stable fallback', async () => {
    render(
      <MemoryRouter initialEntries={['/pedido-confirmado/41']}>
        <AppRouter />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('status', { name: 'Carregando confirmação do pedido' }),
    ).toHaveClass('min-h-96')
    expect(
      await screen.findByRole('heading', { name: 'Confirmação carregada' }),
    ).toBeInTheDocument()
  })

  it('loads customer data in a lazy route with an accessible stable fallback', async () => {
    render(
      <MemoryRouter initialEntries={['/minha-conta/dados']}>
        <AppRouter />
      </MemoryRouter>,
    )

    expect(screen.getByRole('status', { name: 'Carregando página de dados' })).toHaveClass('min-h-96')
    expect(await screen.findByRole('heading', { name: 'Dados do cliente carregados' })).toBeInTheDocument()
  })

  it('loads password change in its own lazy route with an accessible stable fallback', async () => {
    render(<MemoryRouter initialEntries={['/minha-conta/senha']}><AppRouter /></MemoryRouter>)
    expect(screen.getByRole('status', { name: 'Carregando página de senha' })).toHaveClass('min-h-96')
    expect(await screen.findByRole('heading', { name: 'Troca de senha carregada' })).toBeInTheDocument()
  })

  it('loads orders in its own lazy route with an accessible stable fallback', async () => {
    render(<MemoryRouter initialEntries={['/pedidos']}><AppRouter /></MemoryRouter>)
    expect(screen.getByRole('status', { name: 'Carregando pedidos' })).toHaveClass('min-h-96')
    expect(await screen.findByRole('heading', { name: 'Meus pedidos' })).toBeInTheDocument()
  })

  it('loads order detail in its own lazy route with an accessible stable fallback', async () => {
    render(<MemoryRouter initialEntries={['/pedidos/41']}><AppRouter /></MemoryRouter>)
    expect(screen.getByRole('status', { name: 'Carregando pedido' })).toHaveClass('min-h-96')
    expect(await screen.findByRole('heading', { name: 'Pedido 41' })).toBeInTheDocument()
  })
})
