import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

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
import { setOrderConfirmation } from '../cache/orderConfirmationCache'

export type CreateOrderMutationVariables = {
  values: CheckoutFormValues
  cart: Cart
}

type CreateOrderAttempt = {
  customerId: number
  cartId: number
  token: string
  userId: number
  controller: AbortController
}

function isCurrentAttempt(attempt: CreateOrderAttempt, createdOrder?: CreatedOrder) {
  const session = useAuthStore.getState().session

  return session?.clienteId === attempt.customerId
    && session.usuarioId === attempt.userId
    && session.token === attempt.token
    && (!createdOrder || createdOrder.customerId === attempt.customerId)
}

export function useCreateOrderMutation() {
  const queryClient = useQueryClient()
  const attempts = useRef(new WeakMap<CreateOrderMutationVariables, CreateOrderAttempt>())
  const pendingControllers = useRef(new Set<CreateOrderAttempt>())

  useEffect(() => useAuthStore.subscribe(() => {
    pendingControllers.current.forEach((attempt) => {
      if (!isCurrentAttempt(attempt)) attempt.controller.abort()
    })
  }), [])

  return useMutation<
    CreatedOrder,
    AppError,
    CreateOrderMutationVariables,
    CreateOrderAttempt | undefined
  >({
    mutationKey: ['checkout', 'create-order'],
    meta: privateCacheMeta,
    mutationFn: (variables) => {
      const attempt = attempts.current.get(variables)
      if (!attempt) {
        throw new AppError({
          kind: 'http',
          status: 401,
          message: 'Sua sessão não é válida. Entre novamente.',
        })
      }

      return createOrder({
        enderecoEntrega: variables.values.enderecoEntrega,
        formaPagamento: variables.values.formaPagamento,
        items: buildOrderItems(variables.cart),
      }, attempt.token, undefined, attempt.controller.signal)
    },
    onMutate: (variables) => {
      const { cart } = variables
      const session = useAuthStore.getState().session
      const customerId = session?.clienteId
      if (!Number.isSafeInteger(customerId) || !customerId || customerId <= 0) return undefined

      const attempt = {
        customerId,
        cartId: cart.id,
        token: session.token,
        userId: session.usuarioId,
        controller: new AbortController(),
      }
      attempts.current.set(variables, attempt)
      pendingControllers.current.add(attempt)
      return attempt
    },
    onSuccess: async (createdOrder, _variables, attempt) => {
      if (!attempt || !isCurrentAttempt(attempt, createdOrder)) return
      setOrderConfirmation(queryClient, createdOrder)

      const cartSession = useCartSessionStore.getState()
      if (cartSession.getCartId(attempt.customerId) === attempt.cartId) {
        cartSession.removeCartId(attempt.customerId)
      }
      queryClient.removeQueries({
        queryKey: cartQueryKeys.detail(attempt.customerId, attempt.cartId),
        exact: true,
      })
      await queryClient.invalidateQueries({ queryKey: orderQueryKeys.all })
    },
    onSettled: (_data, _error, variables, attempt) => {
      attempts.current.delete(variables)
      if (attempt) pendingControllers.current.delete(attempt)
    },
    retry: false,
  })
}
