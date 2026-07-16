import { useEffect } from 'react'

import { isAuthSessionExpired, useAuthStore } from './authStore'

export function AuthSessionInitializer() {
  const session = useAuthStore((state) => state.session)
  const clearSession = useAuthStore((state) => state.clearSession)

  useEffect(() => {
    if (!session) {
      return
    }

    if (isAuthSessionExpired(session)) {
      clearSession()
      return
    }

    let timeout: number

    const scheduleExpiration = () => {
      const expiresIn = Date.parse(session.expiraEm) - Date.now()

      if (expiresIn <= 0) {
        clearSession()
        return
      }

      timeout = window.setTimeout(scheduleExpiration, Math.min(expiresIn, 2_147_483_647))
    }

    scheduleExpiration()

    return () => window.clearTimeout(timeout)
  }, [clearSession, session])

  return null
}
