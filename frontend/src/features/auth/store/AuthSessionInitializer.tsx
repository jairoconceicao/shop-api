import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { clearPrivateSession } from '../session/clearPrivateSession'
import { useAuthStore } from './authStore'

export function AuthSessionInitializer() {
  const queryClient = useQueryClient()
  const session = useAuthStore((state) => state.session)
  const expiredSessionIdentity = useAuthStore((state) => state.expiredSessionIdentity)
  const invalidateExpiredSession = useAuthStore(
    (state) => state.invalidateExpiredSession,
  )
  const consumeExpiredSessionIdentity = useAuthStore(
    (state) => state.consumeExpiredSessionIdentity,
  )

  useEffect(() => {
    if (!expiredSessionIdentity) {
      return
    }

    const identity = consumeExpiredSessionIdentity()
    if (identity) {
      clearPrivateSession(queryClient, identity.clienteId)
    }
  }, [
    consumeExpiredSessionIdentity,
    expiredSessionIdentity,
    queryClient,
  ])

  useEffect(() => {
    if (!session) {
      return
    }

    let timeout: number

    const scheduleExpiration = () => {
      const expiresIn = Date.parse(session.expiraEm) - Date.now()

      if (expiresIn <= 0) {
        invalidateExpiredSession()
        return
      }

      timeout = window.setTimeout(scheduleExpiration, Math.min(expiresIn, 2_147_483_647))
    }

    scheduleExpiration()

    return () => window.clearTimeout(timeout)
  }, [invalidateExpiredSession, session])

  return null
}
