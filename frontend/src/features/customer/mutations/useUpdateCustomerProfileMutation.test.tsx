import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore, type AuthSession } from '../../auth/store/authStore'
import type { CustomerProfile, UpdateCustomerRequest } from '../contracts/customerProfile'
import { customerProfileQueryKeys } from '../queries/useCustomerProfileQuery'
import { useUpdateCustomerProfileMutation } from './useUpdateCustomerProfileMutation'

const { updateCustomerProfile } = vi.hoisted(() => ({ updateCustomerProfile: vi.fn() }))
vi.mock('../services/customerProfileService', () => ({ updateCustomerProfile }))

const session = (clienteId = 7, token = 'captured'): AuthSession => ({
  token, clienteId, tipo: 'Cliente', expiraEm: '2099-01-01T00:00:00Z',
  usuarioId: clienteId, email: `cliente${clienteId}@example.com`,
})

const request: UpdateCustomerRequest = {
  cpf: '12345678901', nome: 'Ana', dataNascimento: '1990-01-01', email: 'ana@example.com',
  endereco: { logradouro: 'Rua A', numero: '10', complemento: null, cep: '12345678', bairro: 'Centro', cidade: 'Sao Paulo', uf: 'SP' },
  celular: { ddd: '11', numero: '999999999', whatsApp: true },
}

function wrapperFor(client: QueryClient) {
  return ({ children }: PropsWithChildren) => <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useUpdateCustomerProfileMutation', () => {
beforeEach(() => {
  updateCustomerProfile.mockReset()
  useAuthStore.getState().setSession(session(), 'session')
})

it('uses explicit attempt variables, disables retry and marks the mutation private', async () => {
  updateCustomerProfile.mockRejectedValue(new Error('fail'))
  const client = new QueryClient({ defaultOptions: { mutations: { retry: 3 } } })
  const variables = { customerId: 7, token: 'captured', request: {} as never }
  const { result } = renderHook(() => useUpdateCustomerProfileMutation(), { wrapper: wrapperFor(client) })
  result.current.mutate(variables)
  await waitFor(() => expect(result.current.isError).toBe(true))
  expect(updateCustomerProfile).toHaveBeenCalledOnce()
  expect(updateCustomerProfile).toHaveBeenCalledWith(variables)
  expect(client.getMutationCache().getAll()[0]?.options.meta).toEqual({ private: true })
})

it('writes the confirmed profile to the exact canonical key before invalidating it', async () => {
  updateCustomerProfile.mockResolvedValue({ customerId: 7 })
  const client = new QueryClient()
  const setQueryData = vi.spyOn(client, 'setQueryData')
  const invalidateQueries = vi.spyOn(client, 'invalidateQueries').mockResolvedValue(undefined)
  const { result } = renderHook(() => useUpdateCustomerProfileMutation(), { wrapper: wrapperFor(client) })

  const confirmed = await result.current.mutateAsync({ customerId: 7, token: 'captured', request })

  const expected: CustomerProfile = { customerId: 7, ...request }
  expect(confirmed).toEqual(expected)
  expect(setQueryData).toHaveBeenCalledWith(customerProfileQueryKeys.detail(7), expected)
  expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: customerProfileQueryKeys.detail(7), exact: true })
  expect(setQueryData.mock.invocationCallOrder[0]).toBeLessThan(invalidateQueries.mock.invocationCallOrder[0]!)
})

it('keeps the mutation pending until exact invalidation finishes', async () => {
  updateCustomerProfile.mockResolvedValue({ customerId: 7 })
  const client = new QueryClient()
  let releaseInvalidation!: () => void
  vi.spyOn(client, 'invalidateQueries').mockReturnValue(new Promise<void>((resolve) => { releaseInvalidation = resolve }))
  const { result } = renderHook(() => useUpdateCustomerProfileMutation(), { wrapper: wrapperFor(client) })
  let settled = false

  const attempt = result.current.mutateAsync({ customerId: 7, token: 'captured', request })
    .finally(() => { settled = true })
  await waitFor(() => expect(client.getQueryData(customerProfileQueryKeys.detail(7))).toEqual({ customerId: 7, ...request }))
  await Promise.resolve()
  expect(settled).toBe(false)

  releaseInvalidation()
  await expect(attempt).resolves.toEqual({ customerId: 7, ...request })
})

it('propagates a rejected invalidation through the mutation promise', async () => {
  updateCustomerProfile.mockResolvedValue({ customerId: 7 })
  const client = new QueryClient()
  vi.spyOn(client, 'invalidateQueries').mockRejectedValue(new Error('invalidation failed'))
  const { result } = renderHook(() => useUpdateCustomerProfileMutation(), { wrapper: wrapperFor(client) })

  await expect(result.current.mutateAsync({ customerId: 7, token: 'captured', request }))
    .rejects.toThrow('invalidation failed')
})

it.each([
  ['logout', null],
  ['customer change', session(8, 'other')],
  ['token rotation', session(7, 'rotated')],
] as const)('ignores a late successful response after %s', async (_scenario, currentSession) => {
  let release!: (value: { customerId: number }) => void
  updateCustomerProfile.mockReturnValue(new Promise((resolve) => { release = resolve }))
  const client = new QueryClient()
  const setQueryData = vi.spyOn(client, 'setQueryData')
  const invalidateQueries = vi.spyOn(client, 'invalidateQueries')
  const { result } = renderHook(() => useUpdateCustomerProfileMutation(), { wrapper: wrapperFor(client) })

  const attempt = result.current.mutateAsync({ customerId: 7, token: 'captured', request })
  if (currentSession) useAuthStore.getState().setSession(currentSession, 'session')
  else useAuthStore.getState().clearSession()
  release({ customerId: 7 })

  await expect(attempt).rejects.toMatchObject({ status: 403 })
  expect(setQueryData).not.toHaveBeenCalled()
  expect(invalidateQueries).not.toHaveBeenCalled()
})
})
