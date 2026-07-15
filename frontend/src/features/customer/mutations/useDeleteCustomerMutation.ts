import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppError } from '../../../shared/errors/appError'
import { clearPrivateCache, privateCacheMeta } from '../../../shared/query/privateCache'
import { useAuthStore } from '../../auth/store/authStore'
import { useCartSessionStore } from '../../cart/store/cartSessionStore'
import { clearCustomerPrivateSnapshots } from '../cache/customerPrivateSnapshots'
import { deleteCustomer, type DeleteCustomerVariables } from '../services/deleteCustomerService'

export function useDeleteCustomerMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const pendingRef = useRef(false)

  return useMutation<{ customerId: number }, AppError, DeleteCustomerVariables>({
    mutationFn: async (attempt) => {
      if (pendingRef.current) {
        throw new AppError({ kind: 'http', status: 409, message: 'O cancelamento já está em andamento.' })
      }
      pendingRef.current = true
      try {
        return await deleteCustomer(attempt)
      } finally {
        pendingRef.current = false
      }
    },
    onSuccess: (result, attempt) => {
      const current = useAuthStore.getState().session
      if (result.customerId !== attempt.customerId
        || current?.clienteId !== attempt.customerId
        || current.token !== attempt.token) return

      useCartSessionStore.getState().removeCartId(attempt.customerId)
      useAuthStore.getState().clearSession()
      clearPrivateCache(queryClient)
      clearCustomerPrivateSnapshots(attempt.customerId)
      navigate('/', { replace: true, state: { accountCancelled: true } })
    },
    retry: false,
    meta: privateCacheMeta,
  })
}
