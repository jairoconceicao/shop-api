import { QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderResult } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { MemoryRouter, type InitialEntry } from 'react-router-dom'

import { FeedbackProvider } from '../../app/providers/FeedbackProvider'
import { UnauthorizedHandlerProvider } from '../../features/auth/context/UnauthorizedHandlerProvider'
import { AuthSessionInitializer } from '../../features/auth/store/AuthSessionInitializer'
import { createQueryClient } from '../query/queryClient'

export type IntegrationRenderResult = RenderResult & {
  queryClient: ReturnType<typeof createQueryClient>
  user: UserEvent
}

export function renderIntegration(
  ui: ReactElement,
  options: { initialEntries?: InitialEntry[] } = {},
): IntegrationRenderResult {
  const queryClient = createQueryClient()
  const user = userEvent.setup()
  const result = render(
    <MemoryRouter initialEntries={options.initialEntries ?? ['/']}>
      <QueryClientProvider client={queryClient}>
        <UnauthorizedHandlerProvider>
          <AuthSessionInitializer />
          <FeedbackProvider>{ui}</FeedbackProvider>
        </UnauthorizedHandlerProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  )

  return { ...result, queryClient, user }
}
