import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  AUTH_STORE_KEY,
  AUTH_STORE_VERSION,
  type AuthSession,
  useAuthStore,
} from './authStore'

const session: AuthSession = {
  token: 'token-value',
  tipo: 'Bearer',
  expiraEm: '2026-07-14T12:00:00.000Z',
  usuarioId: 10,
  clienteId: 20,
  email: 'cliente@example.com',
}

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    useAuthStore.setState({ session: null, persistence: 'session' })
  })

  afterEach(() => useAuthStore.getState().clearSession())

  it('persists a non-permanent session in sessionStorage with a version', () => {
    useAuthStore.getState().setSession(session, 'session')

    expect(localStorage.getItem(AUTH_STORE_KEY)).toBeNull()
    expect(JSON.parse(sessionStorage.getItem(AUTH_STORE_KEY) ?? '')).toEqual({
      state: { session, persistence: 'session' },
      version: AUTH_STORE_VERSION,
    })
  })

  it('persists a permanent session only in localStorage', () => {
    useAuthStore.getState().setSession(session, 'session')
    useAuthStore.getState().setSession(session, 'local')

    expect(sessionStorage.getItem(AUTH_STORE_KEY)).toBeNull()
    expect(localStorage.getItem(AUTH_STORE_KEY)).not.toBeNull()
  })

  it('clears the session from memory and both storages', () => {
    useAuthStore.getState().setSession(session, 'local')

    useAuthStore.getState().clearSession()

    expect(useAuthStore.getState().session).toBeNull()
    expect(localStorage.getItem(AUTH_STORE_KEY)).toBeNull()
    expect(sessionStorage.getItem(AUTH_STORE_KEY)).toBeNull()
  })
})
