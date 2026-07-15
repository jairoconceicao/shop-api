import { queryOptions, useQuery } from '@tanstack/react-query'

import { privateCacheMeta } from '../../../shared/query/privateCache'
import { useAuthStore } from '../../auth/store/authStore'
import { getCustomerProfile } from '../services/customerProfileService'

export const customerProfileQueryKeys = {
  detail: (customerId: number | null) =>
    ['private', 'customer', 'detail', customerId] as const,
}

function isValidCustomerId(customerId: number | undefined): customerId is number {
  return customerId !== undefined && Number.isSafeInteger(customerId) && customerId > 0
}

export function customerProfileQueryOptions(
  customerId: number | undefined,
  token: string | undefined,
  enabled = true,
) {
  const hasCustomerId = isValidCustomerId(customerId)
  const hasToken = token !== undefined && token.trim().length > 0
  const canFetch = enabled && hasCustomerId && hasToken

  return queryOptions({
    queryKey: customerProfileQueryKeys.detail(hasCustomerId && hasToken ? customerId : null),
    queryFn: ({ signal }) => {
      if (!canFetch) throw new Error('Customer session is unavailable')
      return getCustomerProfile(customerId, token, signal)
    },
    enabled: canFetch,
    meta: privateCacheMeta,
  })
}

export function useCustomerProfileQuery(enabled = true) {
  const session = useAuthStore((state) => state.session)
  return useQuery(customerProfileQueryOptions(session?.clienteId, session?.token, enabled))
}
