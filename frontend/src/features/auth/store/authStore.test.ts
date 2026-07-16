import { act, render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
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

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    useAuthStore.getState().clearSession()
    window.localStorage.clear()
    window.sessionStorage.clear()
  })

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
    expect(
      isAuthSessionExpired(
        { ...session, expiraEm: '2026-07-14T09:00:00-03:00' },
        Date.parse(session.expiraEm) - 1,
      ),
    ).toBe(false)
  })

  it('keeps hydration usable when storage reads fail', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Storage unavailable')
    })

    await expect(useAuthStore.persist.rehydrate()).resolves.toBeUndefined()

    expect(useAuthStore.getState()).toMatchObject({ session: null, persistence: 'session' })
  })

  it('preserves memory and cleans stale storage when the target write fails', () => {
    window.localStorage.setItem(AUTH_STORE_KEY, 'stale')
    const setItem = Storage.prototype.setItem
    const removeItem = vi.spyOn(Storage.prototype, 'removeItem')
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (
      this: Storage,
      key,
      value,
    ) {
      if (this === window.sessionStorage) {
        throw new DOMException('Storage unavailable')
      }

      return Reflect.apply(setItem, this, [key, value])
    })

    expect(() => useAuthStore.getState().setSession(session, 'session')).not.toThrow()

    expect(useAuthStore.getState()).toMatchObject({ session, persistence: 'session' })
    expect(window.localStorage.getItem(AUTH_STORE_KEY)).toBeNull()
    expect(removeItem.mock.contexts.filter((storage) => storage === window.localStorage)).toHaveLength(2)
  })

  it('clears memory when storage removals fail', () => {
    useAuthStore.setState({ session, persistence: 'local' })
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new DOMException('Storage unavailable')
    })

    expect(() => useAuthStore.getState().clearSession()).not.toThrow()

    expect(useAuthStore.getState()).toMatchObject({ session: null, persistence: 'session' })
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
  })

  it('restores a current-version session whose future expiration has an offset', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-14T11:59:59.000Z'))
    const sessionWithOffset = {
      ...session,
      expiraEm: '2026-07-14T09:00:00-03:00',
    }
    window.localStorage.setItem(
      AUTH_STORE_KEY,
      JSON.stringify({
        state: { session: sessionWithOffset, persistence: 'local' },
        version: AUTH_STORE_VERSION,
      }),
    )

    await useAuthStore.persist.rehydrate()

    expect(useAuthStore.getState()).toMatchObject({
      session: sessionWithOffset,
      persistence: 'local',
    })
    expect(window.localStorage.getItem(AUTH_STORE_KEY)).not.toBeNull()
  })

  it.each([
    ['a session property', { session: { ...session, extra: 'remote' }, persistence: 'local' }],
    ['a state property', { session, persistence: 'local', extra: 'remote' }],
    ['a missing expiration', { session: { ...session, expiraEm: undefined }, persistence: 'local' }],
    ['an invalid expiration', { session: { ...session, expiraEm: 'invalid' }, persistence: 'local' }],
    ['an invalid email', { session: { ...session, email: 'invalid' }, persistence: 'local' }],
    ['an unsafe id', { session: { ...session, usuarioId: Number.MAX_SAFE_INTEGER + 1 }, persistence: 'local' }],
    ['an invalid persistence', { session, persistence: 'permanent' }],
  ])('discards a current-version payload containing %s', async (_description, state) => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-14T11:59:59.000Z'))
    window.localStorage.setItem(
      AUTH_STORE_KEY,
      JSON.stringify({ state, version: AUTH_STORE_VERSION }),
    )

    await useAuthStore.persist.rehydrate()

    expect(useAuthStore.getState()).toMatchObject({ session: null, persistence: 'session' })
    expect(window.localStorage.getItem(AUTH_STORE_KEY)).toBeNull()
    expect(window.sessionStorage.getItem(AUTH_STORE_KEY)).toBeNull()
  })

  it('discards a version-zero payload without leaving a wrapper', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    window.localStorage.setItem(
      AUTH_STORE_KEY,
      JSON.stringify({ state: { session, persistence: 'local' }, version: 0 }),
    )

    await useAuthStore.persist.rehydrate()

    expect(useAuthStore.getState()).toMatchObject({ session: null, persistence: 'session' })
    expect(window.localStorage.getItem(AUTH_STORE_KEY)).toBeNull()
    expect(window.sessionStorage.getItem(AUTH_STORE_KEY)).toBeNull()
    expect(consoleError).not.toHaveBeenCalled()
  })

  it.each(['localStorage', 'sessionStorage'] as const)(
    'discards corrupt JSON from %s without rejecting hydration',
    async (storageName) => {
      window[storageName].setItem(AUTH_STORE_KEY, '{')

      await expect(useAuthStore.persist.rehydrate()).resolves.toBeUndefined()

      expect(useAuthStore.getState()).toMatchObject({ session: null, persistence: 'session' })
      expect(window.localStorage.getItem(AUTH_STORE_KEY)).toBeNull()
      expect(window.sessionStorage.getItem(AUTH_STORE_KEY)).toBeNull()
    },
  )

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
    expect(useAuthStore.getState().expiredSessionIdentity).toEqual({ clienteId: 20 })
    expect(window.localStorage.getItem(AUTH_STORE_KEY)).toBeNull()
    expect(useAuthStore.getState().consumeExpiredSessionIdentity()).toEqual({ clienteId: 20 })
    expect(useAuthStore.getState().consumeExpiredSessionIdentity()).toBeNull()
  })

  it('never persists the transient expired-session identity after a real write', async () => {
    useAuthStore.setState({
      expiredSessionIdentity: { clienteId: 20 },
    })

    useAuthStore.getState().setSession(session, 'local')

    expect(JSON.parse(window.localStorage.getItem(AUTH_STORE_KEY) ?? '')).toEqual({
      state: { session, persistence: 'local' },
      version: AUTH_STORE_VERSION,
    })
    expect(window.localStorage.getItem(AUTH_STORE_KEY)).not.toContain(
      'expiredSessionIdentity',
    )
  })

  it('invalidates the active session when its expiration is reached', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-14T11:59:59.000Z'))
    useAuthStore.getState().setSession(session, 'session')
    render(
      createElement(
        QueryClientProvider,
        { client: new QueryClient() },
        createElement(AuthSessionInitializer),
      ),
    )

    act(() => vi.advanceTimersByTime(1_000))

    expect(useAuthStore.getState().session).toBeNull()
    expect(window.sessionStorage.getItem(AUTH_STORE_KEY)).toBeNull()
  })
})
