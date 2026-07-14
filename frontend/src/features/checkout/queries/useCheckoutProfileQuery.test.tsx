import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AppError } from '../../../shared/errors/appError'
import type { AuthSession } from '../../auth/store/authStore'
import { useAuthStore } from '../../auth/store/authStore'
import {
  checkoutProfileQueryKeys,
  checkoutProfileQueryOptions,
  useCheckoutProfileQuery,
} from './useCheckoutProfileQuery'

const { getCheckoutProfile } = vi.hoisted(() => ({ getCheckoutProfile: vi.fn() }))

vi.mock('../services/getCheckoutProfileService', () => ({ getCheckoutProfile }))

const session = (clienteId: number, token = 'access-token'): AuthSession => ({
  token,
  tipo: 'Bearer',
  expiraEm: '2099-07-14T12:00:00Z',
  usuarioId: 1,
  clienteId,
  email: 'customer@example.com',
})

function createHarness() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { queryClient, wrapper }
}

describe('useCheckoutProfileQuery', () => {
  beforeEach(() => {
    getCheckoutProfile.mockReset()
    useAuthStore.setState({ session: session(42) })
  })

  it('uses the private customer key and fetches with the current session', async () => {
    const profile = { customerId: 42, address: { cep: '12345678' } }
    getCheckoutProfile.mockResolvedValue(profile)
    const { queryClient, wrapper } = createHarness()
    const { result } = renderHook(() => useCheckoutProfileQuery(), { wrapper })

    await waitFor(() => expect(result.current.data).toBe(profile))
    expect(getCheckoutProfile).toHaveBeenCalledWith(42, 'access-token', expect.any(AbortSignal))
    const query = queryClient.getQueryCache().find({
      queryKey: checkoutProfileQueryKeys.detail(42),
    })
    expect(query?.queryKey).toEqual(['customer', 'checkout-profile', 42])
    expect(query?.queryKey).not.toContain('access-token')
    expect(query?.meta).toEqual({ private: true })
  })

  it.each([
    [undefined, undefined],
    [0, 'access-token'],
    [-1, 'access-token'],
    [Number.MAX_SAFE_INTEGER + 1, 'access-token'],
    [42, '   '],
  ])('stays disabled without a real customer id and token: %s/%s', async (customerId, token) => {
    const options = checkoutProfileQueryOptions(customerId, token)
    expect(options.enabled).toBe(false)

    useAuthStore.setState({
      session: customerId === undefined ? null : session(customerId, token),
    })
    const { wrapper } = createHarness()
    const { result } = renderHook(() => useCheckoutProfileQuery(), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
    await act(() => result.current.refetch())
    expect(getCheckoutProfile).not.toHaveBeenCalled()
  })

  it('exposes an actionable refetch that retries a failed preload', async () => {
    const error = new AppError({ kind: 'network', message: 'Sem conexao.' })
    const profile = { customerId: 42, address: { cep: '12345678' } }
    getCheckoutProfile.mockRejectedValueOnce(error).mockResolvedValueOnce(profile)
    const { wrapper } = createHarness()
    const { result } = renderHook(() => useCheckoutProfileQuery(), { wrapper })

    await waitFor(() => expect(result.current.error).toBe(error))
    await act(() => result.current.refetch())
    await waitFor(() => expect(result.current.data).toBe(profile))
    expect(getCheckoutProfile).toHaveBeenCalledTimes(2)
  })
})
