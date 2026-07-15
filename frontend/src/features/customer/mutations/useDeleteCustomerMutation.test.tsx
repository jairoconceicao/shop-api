import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppError } from '../../../shared/errors/appError'
import { useAuthStore, type AuthSession } from '../../auth/store/authStore'
import { useCartSessionStore } from '../../cart/store/cartSessionStore'
import { registerCustomerPrivateSnapshot } from '../cache/customerPrivateSnapshots'
import { useDeleteCustomerMutation } from './useDeleteCustomerMutation'

const { deleteCustomerMock } = vi.hoisted(() => ({ deleteCustomerMock: vi.fn() }))
vi.mock('../services/deleteCustomerService', () => ({ deleteCustomer: deleteCustomerMock }))

const session = (id: number, token = `token-${id}`): AuthSession => ({ token, tipo: 'Cliente', expiraEm: '2099-01-01T00:00:00Z', usuarioId: id, clienteId: id, email: `c${id}@example.com` })

function setup(client = new QueryClient({ defaultOptions: { mutations: { retry: 3 } } })) {
  const wrapper = ({ children }: PropsWithChildren) => <MemoryRouter initialEntries={['/minha-conta/dados']}><QueryClientProvider client={client}>{children}</QueryClientProvider></MemoryRouter>
  return { client, hook: renderHook(() => ({ mutation: useDeleteCustomerMutation(), location: useLocation() }), { wrapper }) }
}

describe('useDeleteCustomerMutation', () => {
  beforeEach(() => {
    deleteCustomerMock.mockReset()
    useAuthStore.getState().clearSession()
    useCartSessionStore.setState({ cartIdsByCustomer: {} })
    localStorage.clear(); sessionStorage.clear()
  })

  it('cleans only attempted private state after a valid success and navigates with replace feedback', async () => {
    deleteCustomerMock.mockResolvedValue({ customerId: 7 })
    localStorage.setItem('shop-api:auth', 'stale-local')
    sessionStorage.setItem('shop-api:auth', 'stale-session')
    useAuthStore.getState().setSession(session(7), 'local')
    useCartSessionStore.getState().setCartId(7, 77); useCartSessionStore.getState().setCartId(8, 88)
    const snapshot = vi.fn(); registerCustomerPrivateSnapshot(7, snapshot)
    const { client, hook } = setup()
    client.setQueryData(['public'], 'keep')
    client.setQueryDefaults(['private'], { meta: { private: true } }); client.setQueryData(['private'], 'remove')
    client.getMutationCache().build(client, { mutationKey: ['private-extra'], mutationFn: async () => undefined, meta: { private: true } })
    client.getMutationCache().build(client, { mutationKey: ['public-extra'], mutationFn: async () => undefined })

    await act(() => hook.result.current.mutation.mutateAsync({ customerId: 7, token: 'token-7' }))

    expect(useCartSessionStore.getState().getCartId(7)).toBeUndefined()
    expect(useCartSessionStore.getState().getCartId(8)).toBe(88)
    expect(useAuthStore.getState().session).toBeNull()
    expect(localStorage.getItem('shop-api:auth')).toBeNull()
    expect(sessionStorage.getItem('shop-api:auth')).toBeNull()
    expect(client.getQueryData(['private'])).toBeUndefined()
    expect(client.getQueryData(['public'])).toBe('keep')
    expect(client.getMutationCache().find({ mutationKey: ['private-extra'], exact: true })).toBeUndefined()
    expect(client.getMutationCache().find({ mutationKey: ['public-extra'], exact: true })).toBeDefined()
    expect(snapshot).toHaveBeenCalledOnce()
    expect(hook.result.current.location).toMatchObject({ pathname: '/', state: { accountCancelled: true } })
  })

  it('preserves all state on failure and allows a manual retry', async () => {
    deleteCustomerMock.mockRejectedValueOnce(new AppError({ kind: 'http', status: 422, message: 'Não permitido' })).mockResolvedValueOnce({ customerId: 7 })
    useAuthStore.getState().setSession(session(7), 'session'); useCartSessionStore.getState().setCartId(7, 77)
    const { hook } = setup()
    await expect(act(() => hook.result.current.mutation.mutateAsync({ customerId: 7, token: 'token-7' }))).rejects.toBeInstanceOf(AppError)
    expect(useAuthStore.getState().session?.clienteId).toBe(7)
    expect(useCartSessionStore.getState().getCartId(7)).toBe(77)
    await act(() => hook.result.current.mutation.mutateAsync({ customerId: 7, token: 'token-7' }))
    expect(deleteCustomerMock).toHaveBeenCalledTimes(2)
  })

  it('ignores a late response when the full session identity changed', async () => {
    let release!: (value: { customerId: number }) => void
    deleteCustomerMock.mockReturnValue(new Promise((resolve) => { release = resolve }))
    useAuthStore.getState().setSession(session(7), 'session'); useCartSessionStore.getState().setCartId(7, 77)
    const { hook } = setup()
    act(() => hook.result.current.mutation.mutate({ customerId: 7, token: 'token-7' }))
    useAuthStore.getState().setSession(session(7, 'replacement'), 'session')
    release({ customerId: 7 })
    await waitFor(() => expect(hook.result.current.mutation.isSuccess).toBe(true))
    expect(useAuthStore.getState().session?.token).toBe('replacement')
    expect(useCartSessionStore.getState().getCartId(7)).toBe(77)
    expect(hook.result.current.location.pathname).toBe('/minha-conta/dados')
  })

  it('does not duplicate a pending attempt', async () => {
    deleteCustomerMock.mockReturnValue(new Promise(() => undefined))
    useAuthStore.getState().setSession(session(7), 'session')
    const { hook } = setup()
    act(() => { hook.result.current.mutation.mutate({ customerId: 7, token: 'token-7' }); hook.result.current.mutation.mutate({ customerId: 7, token: 'token-7' }) })
    await waitFor(() => expect(deleteCustomerMock).toHaveBeenCalledTimes(1))
  })
})
