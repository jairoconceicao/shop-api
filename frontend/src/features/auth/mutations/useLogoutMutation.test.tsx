import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { privateCacheMeta } from '../../../shared/query/privateCache'
import { useAuthStore, type AuthSession } from '../store/authStore'
import { logout } from '../services/logoutService'
import { useLogoutMutation } from './useLogoutMutation'

vi.mock('../services/logoutService', () => ({ logout: vi.fn() }))

const session: AuthSession = {
  token: 'expired-or-revoked-token',
  tipo: 'Bearer',
  expiraEm: '2099-01-01T00:00:00Z',
  usuarioId: 10,
  clienteId: 20,
  email: 'cliente@exemplo.com',
}

describe('useLogoutMutation', () => {
  beforeEach(() => {
    vi.mocked(logout).mockReset()
    useAuthStore.getState().clearSession()
  })

  it.each([
    ['success', undefined],
    ['an expired or revoked token error', new Error('Unauthorized')],
  ])('clears local private data after remote logout %s', async (_, remoteError) => {
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    queryClient.setQueryDefaults(['profile'], { meta: privateCacheMeta })
    queryClient.setQueryData(['profile'], { name: 'Customer' })
    queryClient.setQueryData(['catalog'], ['Product'])
    useAuthStore.getState().setSession(session, 'session')

    if (remoteError) vi.mocked(logout).mockRejectedValue(remoteError)
    else vi.mocked(logout).mockResolvedValue(undefined)

    function wrapper({ children }: PropsWithChildren) {
      return (
        <MemoryRouter initialEntries={['/entrar']}>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </MemoryRouter>
      )
    }

    const { result } = renderHook(
      () => ({ mutation: useLogoutMutation(), location: useLocation() }),
      { wrapper },
    )

    act(() => result.current.mutation.mutate(session.token))

    await waitFor(() => expect(result.current.mutation.isPending).toBe(false))
    expect(logout).toHaveBeenCalledWith(session.token)
    expect(useAuthStore.getState().session).toBeNull()
    expect(queryClient.getQueryData(['profile'])).toBeUndefined()
    expect(queryClient.getQueryData(['catalog'])).toEqual(['Product'])
    expect(result.current.location.pathname).toBe('/entrar')
  })
})
