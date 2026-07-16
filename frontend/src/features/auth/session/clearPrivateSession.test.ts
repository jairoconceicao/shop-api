import { QueryClient } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  clearCustomerPrivateSnapshots,
  registerCustomerPrivateSnapshot,
} from '../../customer/cache/customerPrivateSnapshots'
import {
  CART_SESSION_STORE_KEY,
  useCartSessionStore,
} from '../../cart/store/cartSessionStore'
import { AUTH_STORE_KEY, type AuthSession, useAuthStore } from '../store/authStore'
import { clearPrivateSession } from './clearPrivateSession'

const session: AuthSession = {
  token: 'token',
  tipo: 'Bearer',
  expiraEm: '2099-01-01T00:00:00Z',
  usuarioId: 6,
  clienteId: 7,
  email: 'cliente@example.com',
}

describe('clearPrivateSession', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    useAuthStore.setState({ session: null, persistence: 'session' })
    useCartSessionStore.setState({ cartIdsByCustomer: {} })
    clearCustomerPrivateSnapshots(7)
    clearCustomerPrivateSnapshots(8)
  })

  it('clears only private state owned by the expired customer', () => {
    const queryClient = new QueryClient()
    const clearCustomerSnapshot = vi.fn()
    const clearOtherSnapshot = vi.fn()

    useAuthStore.getState().setSession(session, 'local')
    sessionStorage.setItem(AUTH_STORE_KEY, 'stale-session-copy')
    sessionStorage.setItem(CART_SESSION_STORE_KEY, 'stale-cart-copy')
    localStorage.setItem('public-preference', 'dark')
    sessionStorage.setItem('public-preference', 'compact')
    useCartSessionStore.getState().setCartId(7, 70)
    useCartSessionStore.getState().setCartId(8, 80)
    queryClient.setQueryDefaults(['private', 'profile', 7], {
      meta: { private: true },
    })
    queryClient.setQueryData(['private', 'profile', 7], { name: 'Private' })
    queryClient.setQueryDefaults(['public', 'catalog'], {
      meta: { private: false },
    })
    queryClient.setQueryData(['public', 'catalog'], ['Public'])
    queryClient.getMutationCache().build(queryClient, {
      mutationKey: ['private', 'save', 7],
      mutationFn: async () => undefined,
      meta: { private: true },
    })
    queryClient.getMutationCache().build(queryClient, {
      mutationKey: ['public', 'newsletter'],
      mutationFn: async () => undefined,
      meta: { private: false },
    })
    registerCustomerPrivateSnapshot(7, clearCustomerSnapshot)
    registerCustomerPrivateSnapshot(8, clearOtherSnapshot)

    clearPrivateSession(queryClient, 7)
    clearPrivateSession(queryClient, 7)

    expect(useAuthStore.getState().session).toBeNull()
    expect(localStorage.getItem(AUTH_STORE_KEY)).toBeNull()
    expect(sessionStorage.getItem(AUTH_STORE_KEY)).toBeNull()
    expect(useCartSessionStore.getState().getCartId(7)).toBeUndefined()
    expect(useCartSessionStore.getState().getCartId(8)).toBe(80)
    expect(localStorage.getItem(CART_SESSION_STORE_KEY)).not.toContain('"7":70')
    expect(sessionStorage.getItem(CART_SESSION_STORE_KEY)).toBeNull()
    expect(localStorage.getItem('public-preference')).toBe('dark')
    expect(sessionStorage.getItem('public-preference')).toBe('compact')
    expect(queryClient.getQueryData(['private', 'profile', 7])).toBeUndefined()
    expect(queryClient.getQueryData(['public', 'catalog'])).toEqual(['Public'])
    expect(
      queryClient.getMutationCache().find({ mutationKey: ['private', 'save', 7] }),
    ).toBeUndefined()
    expect(
      queryClient.getMutationCache().find({ mutationKey: ['public', 'newsletter'] }),
    ).toBeDefined()
    expect(clearCustomerSnapshot).toHaveBeenCalledOnce()
    expect(clearOtherSnapshot).not.toHaveBeenCalled()
  })
})
