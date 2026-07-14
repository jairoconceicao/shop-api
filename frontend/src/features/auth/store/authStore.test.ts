import { act, render } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthSessionInitializer } from './AuthSessionInitializer'
import {
  AUTH_STORE_KEY,
  AUTH_STORE_VERSION,
  type AuthSession,
  isAuthSessionExpired,
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
    window.localStorage.clear()
    window.sessionStorage.clear()
    useAuthStore.setState({ session: null, persistence: 'session' })
  })

  afterEach(() => useAuthStore.getState().clearSession())

  it('persists a non-permanent session in sessionStorage with a version', () => {
    useAuthStore.getState().setSession(session, 'session')

    expect(window.localStorage.getItem(AUTH_STORE_KEY)).toBeNull()
    expect(JSON.parse(window.sessionStorage.getItem(AUTH_STORE_KEY) ?? '')).toEqual({
      state: { session, persistence: 'session' },
      version: AUTH_STORE_VERSION,
    })
  })

  it('persists a permanent session only in localStorage', () => {
    useAuthStore.getState().setSession(session, 'session')
    useAuthStore.getState().setSession(session, 'local')

    expect(window.sessionStorage.getItem(AUTH_STORE_KEY)).toBeNull()
    expect(window.localStorage.getItem(AUTH_STORE_KEY)).not.toBeNull()
  })

  it('clears the session from memory and both storages', () => {
    useAuthStore.getState().setSession(session, 'local')

    useAuthStore.getState().clearSession()

    expect(useAuthStore.getState().session).toBeNull()
    expect(window.localStorage.getItem(AUTH_STORE_KEY)).toBeNull()
    expect(window.sessionStorage.getItem(AUTH_STORE_KEY)).toBeNull()
  })

  it('identifies missing, invalid and elapsed expiration data as expired', () => {
    expect(isAuthSessionExpired(session, Date.parse(session.expiraEm) - 1)).toBe(false)
    expect(isAuthSessionExpired(session, Date.parse(session.expiraEm))).toBe(true)
    expect(isAuthSessionExpired({ ...session, expiraEm: 'invalid-date' })).toBe(true)
    expect(isAuthSessionExpired({ ...session, token: '' })).toBe(true)
  })

  it('restores a persisted session that has not expired', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-14T11:59:59.000Z'))
    window.localStorage.setItem(
      AUTH_STORE_KEY,
      JSON.stringify({ state: { session, persistence: 'local' }, version: AUTH_STORE_VERSION }),
    )

    await useAuthStore.persist.rehydrate()

    expect(useAuthStore.getState()).toMatchObject({ session, persistence: 'local' })
    vi.useRealTimers()
  })

  it('invalidates an expired restored session and removes its persistence', async () => {
    const expiredSession = { ...session, expiraEm: '2000-01-01T00:00:00.000Z' }
    window.localStorage.setItem(
      AUTH_STORE_KEY,
      JSON.stringify({
        state: { session: expiredSession, persistence: 'local' },
        version: AUTH_STORE_VERSION,
      }),
    )

    await useAuthStore.persist.rehydrate()

    expect(useAuthStore.getState().session).toBeNull()
    expect(window.localStorage.getItem(AUTH_STORE_KEY)).toBeNull()
  })

  it('invalidates the active session when its expiration is reached', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-14T11:59:59.000Z'))
    useAuthStore.getState().setSession(session, 'session')
    render(createElement(AuthSessionInitializer))

    act(() => vi.advanceTimersByTime(1_000))

    expect(useAuthStore.getState().session).toBeNull()
    expect(window.sessionStorage.getItem(AUTH_STORE_KEY)).toBeNull()
    vi.useRealTimers()
  })
})
