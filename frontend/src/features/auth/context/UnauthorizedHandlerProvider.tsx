import { useQueryClient } from '@tanstack/react-query'
import { type PropsWithChildren, useCallback, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { subscribeToUnauthorized } from '../../../shared/api/apiClient'
import { clearPrivateCache } from '../../../shared/query/privateCache'
import { useAuthStore } from '../store/authStore'
import { UnauthorizedHandlerContext } from './UnauthorizedHandlerContext'

export function UnauthorizedHandlerProvider({ children }: PropsWithChildren) {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const handleUnauthorized = useCallback(() => {
    const returnTo = `${location.pathname}${location.search}${location.hash}`

    useAuthStore.getState().clearSession()
    clearPrivateCache(queryClient)
    navigate('/entrar', { replace: true, state: { returnTo } })
  }, [location.hash, location.pathname, location.search, navigate, queryClient])

  useEffect(() => subscribeToUnauthorized(handleUnauthorized), [handleUnauthorized])

  return (
    <UnauthorizedHandlerContext.Provider value={{ handleUnauthorized }}>
      {children}
    </UnauthorizedHandlerContext.Provider>
  )
}
