import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { useContext } from 'react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import { privateCacheMeta } from '../../../shared/query/privateCache'
import { useAuthStore, type AuthSession } from '../store/authStore'
import { UnauthorizedHandlerContext } from './UnauthorizedHandlerContext'
import { UnauthorizedHandlerProvider } from './UnauthorizedHandlerProvider'

const session: AuthSession = {
  token: 'expired-token',
  tipo: 'Bearer',
  expiraEm: '2099-01-01T00:00:00Z',
  usuarioId: 10,
  clienteId: 20,
  email: 'cliente@exemplo.com',
}

function UnauthorizedProbe() {
  const context = useContext(UnauthorizedHandlerContext)
  const location = useLocation()

  return (
    <>
      <button type="button" onClick={context?.handleUnauthorized}>Simular 401</button>
      <p>{`${location.pathname}|${String(location.state?.returnTo)}`}</p>
    </>
  )
}

describe('UnauthorizedHandlerProvider', () => {
  beforeEach(() => useAuthStore.getState().clearSession())

  it('clears the session and private cache, then redirects with the internal return route', () => {
    const queryClient = new QueryClient()
    queryClient.setQueryDefaults(['profile'], { meta: privateCacheMeta })
    queryClient.setQueryData(['profile'], { name: 'Customer' })
    queryClient.setQueryData(['catalog'], ['Product'])
    useAuthStore.getState().setSession(session, 'session')

    render(
      <MemoryRouter initialEntries={['/pedidos?periodo=30#recentes']}>
        <QueryClientProvider client={queryClient}>
          <UnauthorizedHandlerProvider>
            <UnauthorizedProbe />
          </UnauthorizedHandlerProvider>
        </QueryClientProvider>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Simular 401' }))

    expect(useAuthStore.getState().session).toBeNull()
    expect(queryClient.getQueryData(['profile'])).toBeUndefined()
    expect(queryClient.getQueryData(['catalog'])).toEqual(['Product'])
    expect(screen.getByText('/entrar|/pedidos?periodo=30#recentes')).toBeInTheDocument()
  })
})
