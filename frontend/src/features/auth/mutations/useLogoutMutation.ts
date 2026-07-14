import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { clearPrivateCache } from '../../../shared/query/privateCache'
import { logout } from '../services/logoutService'
import { useAuthStore } from '../store/authStore'

export function useLogoutMutation() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (token: string) => logout(token),
    onSettled: () => {
      useAuthStore.getState().clearSession()
      clearPrivateCache(queryClient)
      navigate('/entrar', { replace: true })
    },
    retry: false,
  })
}
