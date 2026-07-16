import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { AppError } from '../../../shared/errors/appError'
import type { CreatedCart } from '../contracts/cart'
import { cartCache, reconcileActiveCart } from '../cache/cartCache'
import { createCart } from '../services/createCartService'
import { useCartSessionStore } from '../store/cartSessionStore'
import { useAuthStore } from '../../auth/store/authStore'

type CreateCartVariables = {
  token: string
  customerId: number
  reconcile?: boolean
}

export function useCreateCartMutation() {
  const setCartId = useCartSessionStore((state) => state.setCartId)
  const queryClient = useQueryClient()

  return useMutation<CreatedCart, AppError, CreateCartVariables>({
    mutationKey: cartCache.mutation.create(0),
    meta: cartCache.meta,
    mutationFn: ({ token }) => createCart(token),
    retry: false,
    onSuccess: async (cart, { customerId, token, reconcile = true }) => {
      const session = useAuthStore.getState().session
      if (session?.clienteId !== customerId || session.token !== token) return
      setCartId(customerId, cart.id)
      if (reconcile) await reconcileActiveCart(queryClient, customerId, cart.id)
    },
  })
}
