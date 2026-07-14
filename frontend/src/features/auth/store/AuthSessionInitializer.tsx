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

    const expiresIn = Date.parse(session.expiraEm) - Date.now()
    const timeout = window.setTimeout(clearSession, expiresIn)

    return () => window.clearTimeout(timeout)
  }, [clearSession, session])

  return null
}
