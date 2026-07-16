import { useQuery } from '@tanstack/react-query'
import { screen, waitFor } from '@testing-library/react'
import { delay, http, HttpResponse } from 'msw'
import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { authSessionFixture } from '../../shared/testing/integrationFixtures'
import { renderIntegration } from '../../shared/testing/renderIntegration'
import { server } from '../../shared/testing/server'
import { apiClient } from '../../shared/api/apiClient'
import { useCartSessionStore } from '../cart/store/cartSessionStore'
import { useLogoutMutation } from './mutations/useLogoutMutation'
import { LoginPage } from './pages/LoginPage'
import { useAuthStore } from './store/authStore'
import { createUnauthorizedHandler, rearmUnauthorizedLatch } from './context/UnauthorizedHandlerProvider'
import { ProtectedRoute } from './routing/ProtectedRoute'

function LocationProbe() {
  const location = useLocation()
  return <output aria-label="Localização atual">{location.pathname}{location.search}</output>
}

function LoginHarness() {
  return <><Routes><Route path="/entrar" element={<LoginPage />} /><Route path="/pedidos" element={<output aria-label="Destino autenticado">Pedidos</output>} /><Route path="/" element={<output aria-label="Destino seguro">Início</output>} /></Routes><LocationProbe /></>
}

function LogoutHarness() {
  const mutation = useLogoutMutation()
  const token = useAuthStore((state) => state.session?.token)
  return <Routes><Route path="/pedidos" element={<button onClick={() => mutation.mutate(token!)}>Sair</button>} /><Route path="/entrar" element={<h1>Entrar na sua conta</h1>} /></Routes>
}

function ProtectedProbe() {
  useQuery({ queryKey: ['private', 'unauthorized-a'], queryFn: ({ signal }) => apiClient.request('/api/v1/cliente/7', { token: 'token-7', signal }), meta: { private: true } })
  useQuery({ queryKey: ['private', 'unauthorized-b'], queryFn: ({ signal }) => apiClient.request('/api/v1/cliente/8', { token: 'token-7', signal }), meta: { private: true } })
  const late = useQuery({ queryKey: ['private', 'late'], queryFn: ({ signal }) => apiClient.request<{ cpf: string }>('/api/v1/cliente/9', { token: 'token-7', signal }), meta: { private: true } })
  return <output aria-label="Perfil tardio">{late.data?.cpf ?? 'vazio'}</output>
}

function NavigationCounter({ onLogin }: { onLogin: () => void }) {
  const location = useLocation()
  useEffect(() => { if (location.pathname === '/entrar') onLogin() }, [location.pathname, onLogin])
  return <LocationProbe />
}

function ProtectedHarness({ onLogin }: { onLogin: () => void }) {
  return <><Routes><Route element={<ProtectedRoute />}><Route path="/pedidos" element={<ProtectedProbe />} /></Route><Route path="/entrar" element={<p>Login seguro</p>} /></Routes><NavigationCounter onLogin={onLogin} /></>
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => { resolve = done })
  return { promise, resolve }
}

function seedSession() {
  useAuthStore.getState().setSession({ token: 'token-7', tipo: 'Bearer', expiraEm: '2099-07-17T12:00:00Z', usuarioId: 3, clienteId: 7, email: 'ana@example.com' }, 'session')
  useCartSessionStore.getState().setCartId(7, 70)
}

describe('TASK-111 auth integration', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com')
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date('2026-07-16T12:00:00Z'))
    localStorage.clear()
    sessionStorage.clear()
    useAuthStore.getState().clearSession()
    useCartSessionStore.setState({ cartIdsByCustomer: {} })
  })

  afterEach(() => { vi.useRealTimers() })

  it.each([
    [{ pathname: '/entrar', state: { returnTo: '/pedidos?page=2' } }, '/pedidos?page=2'],
    [{ pathname: '/entrar', state: { returnTo: 'https://evil.example/x' } }, '/'],
    [{ pathname: '/entrar', state: { returnTo: '//evil.example/x' } }, '/'],
  ])('persists login and resolves safe returnTo %#', async (entry, destination) => {
    const bodies: unknown[] = []
    server.use(http.post('*/api/v1/auth/login', async ({ request }) => {
      bodies.push(await request.json())
      return HttpResponse.json(authSessionFixture)
    }))
    const { user } = renderIntegration(<LoginHarness />, { initialEntries: [entry] })
    await user.type(screen.getByRole('textbox', { name: 'E-mail' }), ' ana@example.com ')
    await user.type(screen.getByLabelText('Senha'), 'segredo123')
    await user.click(screen.getByRole('checkbox', { name: 'Manter conectado' }))
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    await waitFor(() => expect(screen.getByRole('status', { name: 'Localização atual' })).toHaveTextContent(destination))
    expect(bodies).toEqual([{ email: 'ana@example.com', senha: 'segredo123' }])
    expect(localStorage.getItem('shop-api:auth')).toContain('token-7')
    expect(sessionStorage.getItem('shop-api:auth')).toBeNull()
  })

  it.each([401, 500])('clears private state when logout returns %i', async (status) => {
    let calls = 0
    server.use(http.post('*/api/v1/auth/logout', () => {
      calls += 1
      return HttpResponse.json({ error: { message: 'falha' } }, { status })
    }))
    seedSession()
    const { user, queryClient } = renderIntegration(<LogoutHarness />, { initialEntries: ['/pedidos'] })
    queryClient.getQueryCache().build(queryClient, { queryKey: ['private', 'seed'], queryFn: async () => ({ cpf: '12345678901' }), meta: { private: true } }).setData({ cpf: '12345678901' })
    await user.click(await screen.findByRole('button', { name: 'Sair' }))
    expect(await screen.findByRole('heading', { name: 'Entrar na sua conta' })).toBeInTheDocument()
    expect(calls).toBe(1)
    expect(useAuthStore.getState().session).toBeNull()
    expect(sessionStorage.getItem('shop-api:auth')).toBeNull()
    expect(localStorage.getItem('shop-api:auth')).toBeNull()
    expect(useCartSessionStore.getState().getCartId(7)).toBeUndefined()
    expect(queryClient.getQueryData(['private', 'seed'])).toBeUndefined()
  })

  it('executes the real unauthorized boundary once', () => {
    const clearSession = vi.fn()
    const clearCache = vi.fn()
    const navigate = vi.fn()
    const handler = createUnauthorizedHandler({
      getReturnTo: () => '/pedidos',
      clearPrivateSession: () => { clearSession(); clearCache() },
      navigate,
    })
    handler()
    handler()
    expect(clearSession).toHaveBeenCalledOnce()
    expect(clearCache).toHaveBeenCalledOnce()
    expect(navigate).toHaveBeenCalledOnce()
    expect(navigate).toHaveBeenCalledWith('/entrar', { replace: true, state: { returnTo: '/pedidos' } })
  })

  it('rearms the real unauthorized boundary after a new valid session', () => {
    seedSession()
    const clearSession = vi.fn(() => useAuthStore.getState().clearSession())
    const clearCache = vi.fn()
    const navigate = vi.fn()
    const latch = { current: false }
    const handler = createUnauthorizedHandler({
      getReturnTo: () => '/pedidos',
      clearPrivateSession: () => { clearSession(); clearCache() },
      navigate,
    }, latch)
    handler()
    handler()
    expect(clearSession).toHaveBeenCalledOnce()
    expect(clearCache).toHaveBeenCalledOnce()
    expect(navigate).toHaveBeenCalledOnce()
    expect(useCartSessionStore.getState().getCartId(7)).toBe(70)
    seedSession()
    rearmUnauthorizedLatch(latch, useAuthStore.getState().session)
    handler()
    handler()
    expect(clearSession).toHaveBeenCalledTimes(2)
    expect(clearCache).toHaveBeenCalledTimes(2)
    expect(navigate).toHaveBeenCalledTimes(2)
    expect(useAuthStore.getState().session).toBeNull()
    expect(useCartSessionStore.getState().getCartId(7)).toBe(70)
  })

  it('coalesces two concurrent 401 responses and rejects a late 200', async () => {
    const unauthorizedGate = deferred<void>()
    const lateGate = deferred<void>()
    const started: number[] = []
    let cleanupCalls = 0
    let navigationCalls = 0
    server.use(
      http.get('*/api/v1/cliente/7', async () => { started.push(7); await unauthorizedGate.promise; return HttpResponse.json({ error: { message: 'expirada A' } }, { status: 401 }) }),
      http.get('*/api/v1/cliente/8', async () => { started.push(8); await unauthorizedGate.promise; return HttpResponse.json({ error: { message: 'expirada B' } }, { status: 401 }) }),
      http.get('*/api/v1/cliente/9', async () => { started.push(9); await lateGate.promise; await delay(1); return HttpResponse.json({ cpf: '12345678901' }) }),
    )
    seedSession()
    const unsubscribe = useAuthStore.subscribe((state, previous) => { if (previous.session !== null && state.session === null) cleanupCalls += 1 })
    const { queryClient } = renderIntegration(<ProtectedHarness onLogin={() => { navigationCalls += 1 }} />, { initialEntries: ['/pedidos'] })
    await waitFor(() => expect(started).toEqual(expect.arrayContaining([7, 8, 9])))
    unauthorizedGate.resolve()
    expect(await screen.findByRole('status', { name: 'Localização atual' })).toHaveTextContent('/entrar')
    lateGate.resolve()
    await vi.runAllTimersAsync()
    unsubscribe()
    expect(cleanupCalls).toBe(1)
    expect(navigationCalls).toBe(1)
    expect(useAuthStore.getState().session).toBeNull()
    expect(sessionStorage.getItem('shop-api:auth')).toBeNull()
    expect(localStorage.getItem('shop-api:auth')).toBeNull()
    expect(useCartSessionStore.getState().getCartId(7)).toBeUndefined()
    expect(queryClient.getQueryData(['private', 'unauthorized-a'])).toBeUndefined()
    expect(queryClient.getQueryData(['private', 'unauthorized-b'])).toBeUndefined()
    expect(queryClient.getQueryData(['private', 'late'])).toBeUndefined()
    expect(screen.queryByText('12345678901')).not.toBeInTheDocument()
  })
})
