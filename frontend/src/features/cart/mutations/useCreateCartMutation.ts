import { useMutation } from '@tanstack/react-query'

import type { AppError } from '../../../shared/errors/appError'
import type { CreatedCart } from '../contracts/cart'
import { createCart } from '../services/createCartService'
import { useCartSessionStore } from '../store/cartSessionStore'

type CreateCartVariables = {
  token: string
  customerId: number
}

export function useCreateCartMutation() {
  const setCartId = useCartSessionStore((state) => state.setCartId)

  return useMutation<CreatedCart, AppError, CreateCartVariables>({
    mutationFn: ({ token }) => createCart(token),
    retry: false,
    onSuccess: (cart, { customerId }) => setCartId(customerId, cart.id),
  })
}
