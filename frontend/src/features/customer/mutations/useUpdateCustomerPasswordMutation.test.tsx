import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore, type AuthSession } from '../../auth/store/authStore'
import { useUpdateCustomerPasswordMutation } from './useUpdateCustomerPasswordMutation'

const { updateCustomerPassword } = vi.hoisted(() => ({ updateCustomerPassword: vi.fn() }))
vi.mock('../services/customerProfileService', () => ({ updateCustomerPassword }))

const session = (clienteId = 7, token = 'captured'): AuthSession => ({
  token, clienteId, tipo: 'Cliente', expiraEm: '2099-01-01T00:00:00Z', usuarioId: clienteId,
  email: 'ana@example.com',
})
const variables = {
  customerId: 7, token: 'captured', request: { senhaAtual: 'Atual#123', senhaNova: 'Nova#456A' },
}
function wrapperFor(client: QueryClient) {
  return ({ children }: PropsWithChildren) => <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useUpdateCustomerPasswordMutation', () => {
  beforeEach(() => {
    updateCustomerPassword.mockReset()
    useAuthStore.getState().setSession(session(), 'session')
  })

  it('uses captured variables once, disables retry and marks the mutation private', async () => {
    updateCustomerPassword.mockRejectedValue(new Error('fail'))
    const client = new QueryClient({ defaultOptions: { mutations: { retry: 3 } } })
    const { result } = renderHook(() => useUpdateCustomerPasswordMutation(), { wrapper: wrapperFor(client) })
    result.current.mutate(variables)
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(updateCustomerPassword).toHaveBeenCalledOnce()
    expect(updateCustomerPassword).toHaveBeenCalledWith(variables)
    expect(result.current.failureCount).toBe(1)
    expect(client.getMutationCache().getAll()[0]?.options.meta).toEqual({ private: true })
    expect(JSON.stringify(client.getMutationCache().getAll()[0]?.state.variables)).not.toContain('Atual#123')
    expect(JSON.stringify(client.getMutationCache().getAll()[0]?.state.variables)).not.toContain('Nova#456A')
  })

  it('does not retain either password in the mutation cache after success', async () => {
    updateCustomerPassword.mockResolvedValue({ customerId: 7 })
    const client = new QueryClient()
    const { result } = renderHook(() => useUpdateCustomerPasswordMutation(), { wrapper: wrapperFor(client) })

    await expect(result.current.mutateAsync(variables)).resolves.toEqual({ customerId: 7 })

    const cached = JSON.stringify(client.getMutationCache().getAll()[0]?.state.variables)
    expect(cached).not.toContain('Atual#123')
    expect(cached).not.toContain('Nova#456A')
  })

  it.each([
    ['logout', null], ['customer change', session(8, 'other')], ['token rotation', session(7, 'rotated')],
  ] as const)('rejects a late success after %s', async (_name, currentSession) => {
    let release!: (value: { customerId: number }) => void
    updateCustomerPassword.mockReturnValue(new Promise((resolve) => { release = resolve }))
    const client = new QueryClient()
    const { result } = renderHook(() => useUpdateCustomerPasswordMutation(), { wrapper: wrapperFor(client) })
    const attempt = result.current.mutateAsync(variables)
    if (currentSession) useAuthStore.getState().setSession(currentSession, 'session')
    else useAuthStore.getState().clearSession()
    release({ customerId: 7 })
    await expect(attempt).rejects.toMatchObject({ status: 403 })
  })
})
