import { useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { AppError } from '../../../shared/errors/appError'
import { useAuthStore } from '../../auth/store/authStore'
import { updateCustomerPassword, type UpdateCustomerPasswordVariables } from '../services/customerProfileService'

export function useUpdateCustomerPasswordMutation() {
  const attempts = useRef(new Map<number, UpdateCustomerPasswordVariables>())
  const nextAttemptId = useRef(0)
  const mutation = useMutation<{ customerId: number }, AppError, { attemptId: number }>({
    mutationFn: async ({ attemptId }) => {
      const variables = attempts.current.get(attemptId)
      if (!variables) throw new AppError({ kind: 'contract', message: 'Tentativa de alteração de senha indisponível.' })

      try {
        const result = await updateCustomerPassword(variables)
        const current = useAuthStore.getState().session
        if (current?.clienteId !== variables.customerId || current.token !== variables.token) {
          throw new AppError({ kind: 'http', status: 403, message: 'Sessão inválida.' })
        }
        return result
      } finally {
        attempts.current.delete(attemptId)
      }
    },
    retry: false,
    meta: { private: true },
  })

  const storeAttempt = (variables: UpdateCustomerPasswordVariables) => {
    const attemptId = ++nextAttemptId.current
    attempts.current.set(attemptId, variables)
    return { attemptId }
  }

  return {
    ...mutation,
    mutate: (variables: UpdateCustomerPasswordVariables) => mutation.mutate(storeAttempt(variables)),
    mutateAsync: (variables: UpdateCustomerPasswordVariables) => mutation.mutateAsync(storeAttempt(variables)),
  }
}
