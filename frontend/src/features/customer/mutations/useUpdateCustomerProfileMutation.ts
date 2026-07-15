import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AppError } from '../../../shared/errors/appError'
import { useAuthStore } from '../../auth/store/authStore'
import type { CustomerProfile } from '../contracts/customerProfile'
import { customerProfileQueryKeys } from '../queries/useCustomerProfileQuery'
import { updateCustomerProfile, type UpdateCustomerProfileVariables } from '../services/customerProfileService'

export function useUpdateCustomerProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation<CustomerProfile, AppError, UpdateCustomerProfileVariables>({
    mutationFn: async (variables) => {
      await updateCustomerProfile(variables)
      const currentSession = useAuthStore.getState().session
      if (currentSession?.clienteId !== variables.customerId || currentSession.token !== variables.token) {
        throw new AppError({ kind: 'http', status: 403, message: 'Sessão inválida.' })
      }

      const profile: CustomerProfile = { customerId: variables.customerId, ...variables.request }
      const queryKey = customerProfileQueryKeys.detail(variables.customerId)
      queryClient.setQueryData(queryKey, profile)
      await queryClient.invalidateQueries({ queryKey, exact: true }).catch(() => undefined)
      return profile
    },
    retry: false,
    meta: { private: true },
  })
}
