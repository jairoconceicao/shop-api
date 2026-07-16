import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { registerCustomerPrivateSnapshot } from '../../customer/cache/customerPrivateSnapshots'
import { useCartSessionStore } from '../../cart/store/cartSessionStore'
import { AUTH_STORE_KEY, type AuthSession, useAuthStore } from './authStore'
import { AuthSessionInitializer } from './AuthSessionInitializer'

const session: AuthSession = {
  token: 'token',
  tipo: 'Bearer',
  expiraEm: '2026-07-16T15:00:05.000Z',
  usuarioId: 10,
  clienteId: 20,
  email: 'cliente@example.com',
}

function createPrivateState(queryClient: QueryClient) {
  const clearSnapshot = vi.fn()
  useCartSessionStore.getState().setCartId(20, 70)
  queryClient.setQueryDefaults(['private', 'profile', 20], {
    meta: { private: true },
  })
  queryClient.setQueryData(['private', 'profile', 20], { name: 'Private' })
  queryClient.getMutationCache().build(queryClient, {
    mutationKey: ['private', 'save', 20],
    mutationFn: async () => undefined,
    meta: { private: true },
  })
  registerCustomerPrivateSnapshot(20, clearSnapshot)
  return clearSnapshot
}

function renderInitializer(queryClient: QueryClient) {
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthSessionInitializer />
    </QueryClientProvider>,
  )
}

describe('AuthSessionInitializer', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date('2026-07-16T15:00:00.000Z'))
    localStorage.clear()
    sessionStorage.clear()
    useAuthStore.setState({
      session: null,
      persistence: 'session',
      expiredSessionIdentity: null,
    })
    useCartSessionStore.setState({ cartIdsByCustomer: {} })
  })

  afterEach(() => {
    vi.useRealTimers()
    useAuthStore.getState().clearSession()
  })

  it('consumes a restored expired identity and clears all private state', async () => {
    const queryClient = new QueryClient()
    const clearSnapshot = createPrivateState(queryClient)
    localStorage.setItem(AUTH_STORE_KEY, 'stale-local')
    sessionStorage.setItem(AUTH_STORE_KEY, 'stale-session')
    useAuthStore.setState({
      session: null,
      persistence: 'session',
      expiredSessionIdentity: { clienteId: 20 },
    })

    renderInitializer(queryClient)

    await waitFor(() => {
      expect(useAuthStore.getState().expiredSessionIdentity).toBeNull()
    })
    expect(localStorage.getItem(AUTH_STORE_KEY)).toBeNull()
    expect(sessionStorage.getItem(AUTH_STORE_KEY)).toBeNull()
    expect(useCartSessionStore.getState().getCartId(20)).toBeUndefined()
    expect(queryClient.getQueryData(['private', 'profile', 20])).toBeUndefined()
    expect(queryClient.getMutationCache().getAll()).toHaveLength(0)
    expect(clearSnapshot).toHaveBeenCalledOnce()
  })

  it('invalidates and clears private state when an active session reaches expiration', async () => {
    const queryClient = new QueryClient()
    const clearSnapshot = createPrivateState(queryClient)
    useAuthStore.getState().setSession(session, 'local')

    renderInitializer(queryClient)
    act(() => vi.advanceTimersByTime(5_001))

    await waitFor(() => {
      expect(useAuthStore.getState().session).toBeNull()
    })
    expect(useCartSessionStore.getState().getCartId(20)).toBeUndefined()
    expect(queryClient.getQueryData(['private', 'profile', 20])).toBeUndefined()
    expect(clearSnapshot).toHaveBeenCalledOnce()
  })

  it.each([
    ['an invalid expiration', { ...session, expiraEm: 'invalid-date' }],
    ['an empty token', { ...session, token: '' }],
  ])('invalidates %s once without scheduling a loop', async (_case, invalidSession) => {
    const queryClient = new QueryClient()
    const clearSnapshot = createPrivateState(queryClient)
    useAuthStore.getState().setSession(invalidSession, 'local')

    renderInitializer(queryClient)

    await waitFor(() => {
      expect(useAuthStore.getState().session).toBeNull()
    })
    expect(useCartSessionStore.getState().getCartId(20)).toBeUndefined()
    expect(clearSnapshot).toHaveBeenCalledOnce()

    act(() => vi.advanceTimersByTime(60_000))
    expect(clearSnapshot).toHaveBeenCalledOnce()
  })
})
