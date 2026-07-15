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
const wrapper = ({ children }: PropsWithChildren) => <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: 3 } } })}>{children}</QueryClientProvider>

describe('useUpdateCustomerPasswordMutation', () => {
  beforeEach(() => {
    updateCustomerPassword.mockReset()
    useAuthStore.getState().setSession(session(), 'session')
  })

  it('uses captured variables once, disables retry and marks the mutation private', async () => {
    updateCustomerPassword.mockRejectedValue(new Error('fail'))
    const { result } = renderHook(() => useUpdateCustomerPasswordMutation(), { wrapper })
    result.current.mutate(variables)
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(updateCustomerPassword).toHaveBeenCalledOnce()
    expect(updateCustomerPassword).toHaveBeenCalledWith(variables)
    expect(result.current.failureCount).toBe(1)
  })

  it.each([
    ['logout', null], ['customer change', session(8, 'other')], ['token rotation', session(7, 'rotated')],
  ] as const)('rejects a late success after %s', async (_name, currentSession) => {
    let release!: (value: { customerId: number }) => void
    updateCustomerPassword.mockReturnValue(new Promise((resolve) => { release = resolve }))
    const { result } = renderHook(() => useUpdateCustomerPasswordMutation(), { wrapper })
    const attempt = result.current.mutateAsync(variables)
    if (currentSession) useAuthStore.getState().setSession(currentSession, 'session')
    else useAuthStore.getState().clearSession()
    release({ customerId: 7 })
    await expect(attempt).rejects.toMatchObject({ status: 403 })
  })
})
