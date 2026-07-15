import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { AuthSession } from '../../auth/store/authStore'
import { useAuthStore } from '../../auth/store/authStore'
import {
  customerProfileQueryKeys,
  customerProfileQueryOptions,
  useCustomerProfileQuery,
} from './useCustomerProfileQuery'

const { getCustomerProfile } = vi.hoisted(() => ({ getCustomerProfile: vi.fn() }))
vi.mock('../services/customerProfileService', () => ({ getCustomerProfile }))

const session = (clienteId: number, token = 'access-token'): AuthSession => ({
  token, tipo: 'Bearer', expiraEm: '2099-07-14T12:00:00Z', usuarioId: 1,
  clienteId, email: 'customer@example.com',
})

function createHarness() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { queryClient, wrapper }
}

describe('useCustomerProfileQuery', () => {
  beforeEach(() => {
    getCustomerProfile.mockReset()
    useAuthStore.setState({ session: session(7) })
  })

  it('uses the exact private key and captured session credentials', async () => {
    const profile = { customerId: 7, nome: 'Cliente 7' }
    getCustomerProfile.mockResolvedValue(profile)
    const { queryClient, wrapper } = createHarness()
    const { result } = renderHook(() => useCustomerProfileQuery(), { wrapper })
    await waitFor(() => expect(result.current.data).toBe(profile))
    expect(getCustomerProfile).toHaveBeenCalledWith(7, 'access-token', expect.any(AbortSignal))
    const query = queryClient.getQueryCache().find({ queryKey: customerProfileQueryKeys.detail(7) })
    expect(query?.queryKey).toEqual(['private', 'customer', 'detail', 7])
    expect(query?.queryKey).not.toContain('access-token')
    expect(query?.meta).toEqual({ private: true })
  })

  it.each([
    [undefined, undefined], [0, 'access-token'], [-1, 'access-token'],
    [Number.MAX_SAFE_INTEGER + 1, 'access-token'], [7, '   '],
  ])('is safely disabled without a valid id and token: %s/%s', async (customerId, token) => {
    const options = customerProfileQueryOptions(customerId, token)
    expect(options.enabled).toBe(false)
    expect(options.queryKey).toEqual(customerProfileQueryKeys.detail(null))

    const { wrapper } = createHarness()
    const { result } = renderHook(() => useCustomerProfileQuery(false), { wrapper })
    await act(() => result.current.refetch())
    expect(getCustomerProfile).not.toHaveBeenCalled()
  })

  it('keeps a late response under the old customer key after the session changes', async () => {
    let resolveSeven!: (value: { customerId: number; nome: string }) => void
    getCustomerProfile.mockImplementation((customerId: number) => customerId === 7
      ? new Promise((resolve) => { resolveSeven = resolve })
      : Promise.resolve({ customerId: 8, nome: 'Cliente 8' }))
    const { queryClient, wrapper } = createHarness()
    const { result } = renderHook(() => useCustomerProfileQuery(), { wrapper })
    renderHook(
      () => useQuery(customerProfileQueryOptions(7, 'access-token')),
      { wrapper },
    )

    act(() => useAuthStore.setState({ session: session(8, 'token-8') }))
    await waitFor(() => expect(result.current.data).toMatchObject({ customerId: 8 }))
    await act(async () => resolveSeven({ customerId: 7, nome: 'Cliente 7' }))

    expect(result.current.data).toMatchObject({ customerId: 8 })
    expect(queryClient.getQueryData(customerProfileQueryKeys.detail(7))).toMatchObject({ customerId: 7 })
    expect(queryClient.getQueryData(customerProfileQueryKeys.detail(8))).toMatchObject({ customerId: 8 })
    expect(getCustomerProfile).toHaveBeenNthCalledWith(1, 7, 'access-token', expect.any(AbortSignal))
    expect(getCustomerProfile).toHaveBeenNthCalledWith(2, 8, 'token-8', expect.any(AbortSignal))
  })
})
