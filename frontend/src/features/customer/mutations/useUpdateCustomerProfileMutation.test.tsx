import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { expect, it, vi } from 'vitest'
import { useUpdateCustomerProfileMutation } from './useUpdateCustomerProfileMutation'

const { updateCustomerProfile } = vi.hoisted(() => ({ updateCustomerProfile: vi.fn() }))
vi.mock('../services/customerProfileService', () => ({ updateCustomerProfile }))

it('uses explicit attempt variables, disables retry and marks the mutation private', async () => {
  updateCustomerProfile.mockRejectedValue(new Error('fail'))
  const client = new QueryClient({ defaultOptions: { mutations: { retry: 3 } } })
  const wrapper = ({ children }: PropsWithChildren) => <QueryClientProvider client={client}>{children}</QueryClientProvider>
  const variables = { customerId: 7, token: 'captured', request: {} as never }
  const { result } = renderHook(() => useUpdateCustomerProfileMutation(), { wrapper })
  result.current.mutate(variables)
  await waitFor(() => expect(result.current.isError).toBe(true))
  expect(updateCustomerProfile).toHaveBeenCalledOnce()
  expect(updateCustomerProfile).toHaveBeenCalledWith(variables)
  expect(client.getMutationCache().getAll()[0]?.options.meta).toEqual({ private: true })
})
