import type { QueryClient } from '@tanstack/react-query'

import { clearCustomerPrivateSnapshots } from '../../customer/cache/customerPrivateSnapshots'
import {
  CART_SESSION_STORE_KEY,
  useCartSessionStore,
} from '../../cart/store/cartSessionStore'
import { clearPrivateCache } from '../../../shared/query/privateCache'
import { useAuthStore } from '../store/authStore'

export function clearPrivateSession(queryClient: QueryClient, customerId: number) {
  useCartSessionStore.getState().removeCartId(customerId)
  try {
    sessionStorage.removeItem(CART_SESSION_STORE_KEY)
  } catch {
    // Memory cleanup remains authoritative when Web Storage is unavailable.
  }
  useAuthStore.getState().clearSession()
  clearPrivateCache(queryClient)
  clearCustomerPrivateSnapshots(customerId)
}
