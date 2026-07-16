import type { QueryClient } from '@tanstack/react-query'

import { clearCustomerPrivateSnapshots } from '../../customer/cache/customerPrivateSnapshots'
import { useCartSessionStore } from '../../cart/store/cartSessionStore'
import { clearPrivateCache } from '../../../shared/query/privateCache'
import { useAuthStore } from '../store/authStore'

export function clearPrivateSession(queryClient: QueryClient, customerId: number) {
  useCartSessionStore.getState().removeCartId(customerId)
  useAuthStore.getState().clearSession()
  clearPrivateCache(queryClient)
  clearCustomerPrivateSnapshots(customerId)
}
