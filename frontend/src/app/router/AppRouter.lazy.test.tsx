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

describe('AppRouter lazy checkout routes', () => {
  it('shows an accessible fallback while loading checkout on demand', async () => {
    render(
      <MemoryRouter initialEntries={['/checkout']}>
        <AppRouter />
      </MemoryRouter>,
    )

    expect(screen.getByRole('status', { name: 'Carregando checkout' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Checkout carregado' })).toBeInTheDocument()
  })
})
