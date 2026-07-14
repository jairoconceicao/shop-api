import { useMutation } from '@tanstack/react-query'

import { AppError } from '../../../shared/errors/appError'
import { privateCacheMeta } from '../../../shared/query/privateCache'
import type { Cart } from '../../cart/contracts/cart'
import { useAuthStore } from '../../auth/store/authStore'
import { buildOrderItems } from '../adapters/confirmedCartItems'
import type { CheckoutFormValues } from '../contracts/checkout'
import type { CreatedOrder } from '../contracts/order'
import { createOrder } from '../services/createOrderService'

export type CreateOrderMutationVariables = {
  values: CheckoutFormValues
  cart: Cart
}

export function useCreateOrderMutation() {
  const token = useAuthStore((state) => state.session?.token)

  return useMutation<CreatedOrder, AppError, CreateOrderMutationVariables>({
    mutationKey: ['checkout', 'create-order'],
    meta: privateCacheMeta,
    mutationFn: ({ values, cart }) => {
      if (!token) {
        throw new AppError({
          kind: 'http',
          status: 401,
          message: 'Sua sessão não é válida. Entre novamente.',
        })
      }

      return createOrder({
        enderecoEntrega: values.enderecoEntrega,
        formaPagamento: values.formaPagamento,
        items: buildOrderItems(cart),
      }, token)
    },
    retry: false,
  })
}
