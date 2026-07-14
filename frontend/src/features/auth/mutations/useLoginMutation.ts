import { useMutation } from '@tanstack/react-query'

import type { LoginRequest } from '../contracts/login'
import { login } from '../services/loginService'

export function useLoginMutation() {
  return useMutation({
    mutationFn: (request: LoginRequest) => login(request),
    retry: false,
  })
}
