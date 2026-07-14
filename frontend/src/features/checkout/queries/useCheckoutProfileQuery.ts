import { queryOptions, useQuery } from '@tanstack/react-query'

import { privateCacheMeta } from '../../../shared/query/privateCache'
import { useAuthStore } from '../../auth/store/authStore'
import { getCheckoutProfile } from '../services/getCheckoutProfileService'

export const checkoutProfileQueryKeys = {
  detail: (customerId: number | null) =>
    ['customer', 'checkout-profile', customerId] as const,
}

function isRealCustomerId(customerId: number | undefined): customerId is number {
  return customerId !== undefined && Number.isSafeInteger(customerId) && customerId > 0
}

export function checkoutProfileQueryOptions(
  customerId: number | undefined,
  token: string | undefined,
) {
  const hasValidToken = token !== undefined && token.trim().length > 0
  const hasRealCustomerId = isRealCustomerId(customerId)

  return queryOptions({
    queryKey: checkoutProfileQueryKeys.detail(hasRealCustomerId ? customerId : null),
    queryFn: ({ signal }) => {
      if (!hasRealCustomerId || !hasValidToken) {
        throw new Error('Customer session is unavailable')
      }

      return getCheckoutProfile(customerId, token, signal)
    },
    enabled: hasRealCustomerId && hasValidToken,
    meta: privateCacheMeta,
  })
}

export function useCheckoutProfileQuery() {
  const session = useAuthStore((state) => state.session)

  return useQuery(checkoutProfileQueryOptions(session?.clienteId, session?.token))
}
