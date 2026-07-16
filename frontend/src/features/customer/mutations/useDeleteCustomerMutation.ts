import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppError } from '../../../shared/errors/appError'
import { privateCacheMeta } from '../../../shared/query/privateCache'
import { clearPrivateSession } from '../../auth/session/clearPrivateSession'
import { useAuthStore } from '../../auth/store/authStore'
import { deleteCustomer, type DeleteCustomerVariables } from '../services/deleteCustomerService'

export function useDeleteCustomerMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const pendingRef = useRef<Promise<{ customerId: number }> | null>(null)

  const mutation = useMutation<{ customerId: number }, AppError, DeleteCustomerVariables>({
    mutationFn: (attempt) => deleteCustomer(attempt),
    onSuccess: (result, attempt) => {
      const current = useAuthStore.getState().session
      if (result.customerId !== attempt.customerId
        || current?.clienteId !== attempt.customerId
        || current.token !== attempt.token) return

      clearPrivateSession(queryClient, attempt.customerId)
      navigate('/', { replace: true, state: { accountCancelled: true } })
    },
    onSettled: () => { pendingRef.current = null },
    retry: false,
    meta: privateCacheMeta,
  })

  const mutate: typeof mutation.mutate = (attempt, options) => {
    if (pendingRef.current) return
    const request = mutation.mutateAsync(attempt, options)
    pendingRef.current = request
    void request.catch(() => undefined)
  }

  const mutateAsync: typeof mutation.mutateAsync = (attempt, options) => {
    if (pendingRef.current) return pendingRef.current
    const request = mutation.mutateAsync(attempt, options)
    pendingRef.current = request
    return request
  }

  return { ...mutation, mutate, mutateAsync }
}
