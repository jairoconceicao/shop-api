import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore, type AuthSession } from '../store/authStore'
import { ProtectedRoute } from './ProtectedRoute'

const session: AuthSession = {
  token: 'header.payload.signature',
  tipo: 'Bearer',
  expiraEm: '2099-01-01T00:00:00Z',
  usuarioId: 10,
  clienteId: 20,
  email: 'cliente@exemplo.com',
}

function LoginDestination() {
  const location = useLocation()

  return <p>{`${location.pathname}|${String(location.state?.returnTo)}`}</p>
}

function renderProtectedRoute() {
  return render(
    <MemoryRouter initialEntries={['/checkout?etapa=pagamento#resumo']}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="checkout" element={<h1>Checkout protegido</h1>} />
        </Route>
        <Route path="entrar" element={<LoginDestination />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => useAuthStore.getState().clearSession())

  it('redirects a visitor to login preserving only the current internal location', () => {
    renderProtectedRoute()

    expect(screen.getByText('/entrar|/checkout?etapa=pagamento#resumo')).toBeInTheDocument()
  })

  it('renders the protected route for an authenticated customer', () => {
    useAuthStore.getState().setSession(session, 'session')
    renderProtectedRoute()

    expect(screen.getByRole('heading', { name: 'Checkout protegido' })).toBeInTheDocument()
  })

  it('redirects when the stored session is expired', () => {
    const protectedContentMounted = vi.fn()
    function ProtectedContent() {
      protectedContentMounted()
      return <h1>Checkout protegido</h1>
    }
    useAuthStore.getState().setSession({ ...session, expiraEm: '2020-01-01T00:00:00Z' }, 'session')
    render(
      <MemoryRouter initialEntries={['/checkout?etapa=pagamento#resumo']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="checkout" element={<ProtectedContent />} />
          </Route>
          <Route path="entrar" element={<LoginDestination />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('/entrar|/checkout?etapa=pagamento#resumo')).toBeInTheDocument()
    expect(protectedContentMounted).not.toHaveBeenCalled()
  })
})
