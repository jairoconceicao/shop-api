import { useMutation } from '@tanstack/react-query'
import type { AppError } from '../../../shared/errors/appError'
import { updateCustomerProfile, type UpdateCustomerProfileVariables } from '../services/customerProfileService'

export function useUpdateCustomerProfileMutation() {
  return useMutation<{ customerId: number }, AppError, UpdateCustomerProfileVariables>({
    mutationFn: (variables) => updateCustomerProfile(variables),
    retry: false,
    meta: { private: true },
  })
}
