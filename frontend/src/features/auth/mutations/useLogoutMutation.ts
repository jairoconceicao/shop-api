import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { clearPrivateSession } from '../session/clearPrivateSession'
import { logout } from '../services/logoutService'
import { useAuthStore } from '../store/authStore'

export function useLogoutMutation() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (token: string) => logout(token),
    onMutate: (token) => {
      const initial = useAuthStore.getState().session
      return {
        identity: initial?.token === token
          ? { clienteId: initial.clienteId, token: initial.token }
          : null,
      }
    },
    onSettled: (_data, _error, _token, context) => {
      const identity = context?.identity
      const current = useAuthStore.getState().session
      if (identity
        && current?.clienteId === identity.clienteId
        && current.token === identity.token) {
        clearPrivateSession(queryClient, identity.clienteId)
      }
      navigate('/entrar', { replace: true })
    },
    retry: false,
  })
}
