import { QueryClientProvider } from '@tanstack/react-query'
import { type PropsWithChildren } from 'react'
import { BrowserRouter } from 'react-router-dom'

import { AuthSessionInitializer } from '../../features/auth/store/AuthSessionInitializer'
import { UnauthorizedHandlerProvider } from '../../features/auth/context/UnauthorizedHandlerProvider'
import { queryClient } from '../../shared/query/queryClient'
import { FeedbackProvider } from './FeedbackProvider'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <UnauthorizedHandlerProvider>
          <AuthSessionInitializer />
          <FeedbackProvider>{children}</FeedbackProvider>
        </UnauthorizedHandlerProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}
