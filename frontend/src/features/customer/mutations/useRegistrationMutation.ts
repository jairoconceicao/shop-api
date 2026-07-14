import { useMutation } from '@tanstack/react-query'

import type { AppError } from '../../../shared/errors/appError'
import type { CreateCustomerRequest, CreatedCustomer } from '../contracts/registration'
import { registerCustomer } from '../services/registrationService'

export function useRegistrationMutation() {
  return useMutation<CreatedCustomer, AppError, CreateCustomerRequest>({
    mutationFn: (request: CreateCustomerRequest) => registerCustomer(request),
    retry: false,
  })
}
