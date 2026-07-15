import { useMutation, useQueryClient } from '@tanstack/react-query'

import { AppError } from '../../../shared/errors/appError'
import { privateCacheMeta } from '../../../shared/query/privateCache'
import { useAuthStore } from '../../auth/store/authStore'
import type { CancelledOrder, Order } from '../contracts/orders'
import { orderQueryKeys } from '../cache/orderQueryKeys'
import { cancelOrder } from '../services/cancelOrderService'

export type CancelOrderAttempt = {
  orderId: number
  customerId: number
  userId: number
  token: string
}

export type CancelOrderResult = CancelledOrder | { kind: 'cancel-rejected' }

function isCurrentAttempt(attempt: CancelOrderAttempt, result?: CancelledOrder) {
  const session = useAuthStore.getState().session
  return session?.clienteId === attempt.customerId
    && session.usuarioId === attempt.userId
    && session.token === attempt.token
    && (!result || (result.id === attempt.orderId && result.customerId === attempt.customerId))
}

function staleCancellationError() {
  return new AppError({
    kind: 'contract',
    code: 'STALE_ORDER_CANCELLATION',
    message: 'A tentativa de cancelamento não pertence mais à sessão atual.',
  })
}

export function useCancelOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation<CancelOrderResult, AppError, CancelOrderAttempt>({
    mutationKey: ['orders', 'cancel'],
    mutationFn: async (attempt) => {
      if (!isCurrentAttempt(attempt)) throw staleCancellationError()
      try {
        const result = await cancelOrder({ orderId: attempt.orderId, token: attempt.token })
        if (!isCurrentAttempt(attempt, result)) throw staleCancellationError()
        return result
      } catch (error) {
        if (error instanceof AppError && error.status === 422) {
          try {
            await queryClient.invalidateQueries({
              queryKey: orderQueryKeys.detail(attempt.customerId, attempt.orderId),
            })
          } catch {
            // The original server refusal remains the user-facing outcome.
          }
          return { kind: 'cancel-rejected' }
        }
        throw error
      }
    },
    onSuccess: async (result, attempt) => {
      if ('kind' in result) return
      if (!isCurrentAttempt(attempt, result)) throw staleCancellationError()

      queryClient.setQueriesData<Order>(
        { queryKey: orderQueryKeys.detail(attempt.customerId, attempt.orderId) },
        (current) => current ? { ...current, status: result.status } : current,
      )
      await Promise.allSettled([
        queryClient.invalidateQueries({
          queryKey: orderQueryKeys.detail(attempt.customerId, attempt.orderId),
        }),
        queryClient.invalidateQueries({ queryKey: orderQueryKeys.lists(attempt.customerId) }),
      ])
    },
    retry: false,
    meta: privateCacheMeta,
  })
}
