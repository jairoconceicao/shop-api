import { useMutation } from '@tanstack/react-query'
import { AppError } from '../../../shared/errors/appError'
import { useAuthStore } from '../../auth/store/authStore'
import { updateCustomerPassword, type UpdateCustomerPasswordVariables } from '../services/customerProfileService'

export function useUpdateCustomerPasswordMutation() {
  return useMutation<{ customerId: number }, AppError, UpdateCustomerPasswordVariables>({
    mutationFn: async (variables) => {
      const result = await updateCustomerPassword(variables)
      const current = useAuthStore.getState().session
      if (current?.clienteId !== variables.customerId || current.token !== variables.token) {
        throw new AppError({ kind: 'http', status: 403, message: 'Sessão inválida.' })
      }
      return result
    },
    retry: false,
    meta: { private: true },
  })
}
