import { useMutation } from '@tanstack/react-query'

import { AppError } from '../../../shared/errors/appError'
import { privateCacheMeta } from '../../../shared/query/privateCache'
import { useAuthStore } from '../../auth/store/authStore'
import type { CancelledOrder } from '../contracts/orders'
import { cancelOrder } from '../services/cancelOrderService'

export type CancelOrderAttempt = {
  orderId: number
  customerId: number
  userId: number
  token: string
}

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
  return useMutation<CancelledOrder, AppError, CancelOrderAttempt>({
    mutationKey: ['orders', 'cancel'],
    mutationFn: async (attempt) => {
      if (!isCurrentAttempt(attempt)) throw staleCancellationError()
      const result = await cancelOrder({ orderId: attempt.orderId, token: attempt.token })
      if (!isCurrentAttempt(attempt, result)) throw staleCancellationError()
      return result
    },
    retry: false,
    meta: privateCacheMeta,
  })
}
