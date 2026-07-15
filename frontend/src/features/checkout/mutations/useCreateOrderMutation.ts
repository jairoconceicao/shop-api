import { useMutation, useQueryClient } from '@tanstack/react-query'

import { AppError } from '../../../shared/errors/appError'
import { privateCacheMeta } from '../../../shared/query/privateCache'
import type { Cart } from '../../cart/contracts/cart'
import { cartQueryKeys } from '../../cart/queries/useCartQuery'
import { useCartSessionStore } from '../../cart/store/cartSessionStore'
import { useAuthStore } from '../../auth/store/authStore'
import { buildOrderItems } from '../adapters/confirmedCartItems'
import type { CheckoutFormValues } from '../contracts/checkout'
import type { CreatedOrder } from '../contracts/order'
import { createOrder } from '../services/createOrderService'
import { orderQueryKeys } from '../cache/orderCache'

export type CreateOrderMutationVariables = {
  values: CheckoutFormValues
  cart: Cart
}

export function useCreateOrderMutation() {
  const session = useAuthStore((state) => state.session)
  const queryClient = useQueryClient()

  return useMutation<
    CreatedOrder,
    AppError,
    CreateOrderMutationVariables,
    { customerId: number; cartId: number } | undefined
  >({
    mutationKey: ['checkout', 'create-order'],
    meta: privateCacheMeta,
    mutationFn: ({ values, cart }) => {
      if (!session?.token) {
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
      }, session.token)
    },
    onMutate: ({ cart }) => {
      const customerId = session?.clienteId
      if (!Number.isSafeInteger(customerId) || !customerId || customerId <= 0) return undefined

      return { customerId, cartId: cart.id }
    },
    onSuccess: async (_createdOrder, _variables, attempt) => {
      if (!attempt) return

      useCartSessionStore.getState().removeCartId(attempt.customerId)
      queryClient.removeQueries({
        queryKey: cartQueryKeys.detail(attempt.customerId, attempt.cartId),
        exact: true,
      })
      await queryClient.invalidateQueries({ queryKey: orderQueryKeys.all })
    },
    retry: false,
  })
}
