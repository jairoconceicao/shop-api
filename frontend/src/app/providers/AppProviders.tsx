import { QueryClientProvider } from '@tanstack/react-query'
import { type PropsWithChildren } from 'react'
import { BrowserRouter } from 'react-router-dom'

import { queryClient } from '../../shared/query/queryClient'
import { FeedbackProvider } from './FeedbackProvider'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <FeedbackProvider>{children}</FeedbackProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}
