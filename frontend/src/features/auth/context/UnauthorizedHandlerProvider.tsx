import { useQueryClient } from '@tanstack/react-query'
import { type PropsWithChildren, useEffect, useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { subscribeToUnauthorized } from '../../../shared/api/apiClient'
import { clearPrivateSession } from '../session/clearPrivateSession'
import { useAuthStore } from '../store/authStore'
import { UnauthorizedHandlerContext } from './UnauthorizedHandlerContext'

/* eslint-disable react-refresh/only-export-components -- TASK-111 exposes the real boundary factory for integration coverage. */
export type UnauthorizedHandlerDependencies = {
  getReturnTo: () => string
  clearPrivateSession: () => void
  navigate: (to: string, options: { replace: true; state: { returnTo: string } }) => void
}

export type UnauthorizedLatch = { current: boolean }

export function rearmUnauthorizedLatch(
  latch: UnauthorizedLatch,
  session: ReturnType<typeof useAuthStore.getState>['session'],
) {
  if (session) latch.current = false
}

export function createUnauthorizedHandler(
  dependencies: UnauthorizedHandlerDependencies,
  latch: UnauthorizedLatch = { current: false },
) {
  return () => {
    if (latch.current) return

    latch.current = true
    const returnTo = dependencies.getReturnTo()
    dependencies.clearPrivateSession()
    dependencies.navigate('/entrar', { replace: true, state: { returnTo } })
  }
}

export function UnauthorizedHandlerProvider({ children }: PropsWithChildren) {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const session = useAuthStore((state) => state.session)
  const unauthorizedLatch = useRef(false)

  useEffect(() => {
    rearmUnauthorizedLatch(unauthorizedLatch, session)
  }, [session])

  // The factory captures the ref object; it does not read current during render.
  /* eslint-disable react-hooks/refs */
  const handleUnauthorized = useMemo(() => createUnauthorizedHandler({
    getReturnTo: () => `${location.pathname}${location.search}${location.hash}`,
    clearPrivateSession: () => {
      const customerId = useAuthStore.getState().session?.clienteId
      if (customerId !== undefined) clearPrivateSession(queryClient, customerId)
    },
    navigate,
  }, unauthorizedLatch), [location.hash, location.pathname, location.search, navigate, queryClient])
  /* eslint-enable react-hooks/refs */

  useEffect(() => subscribeToUnauthorized(handleUnauthorized), [handleUnauthorized])

  return (
    <UnauthorizedHandlerContext.Provider value={{ handleUnauthorized }}>
      {children}
    </UnauthorizedHandlerContext.Provider>
  )
}
