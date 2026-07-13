import { QueryClient } from '@tanstack/react-query'

import { AppError } from '../errors/appError'

export const queryCacheDefaults = {
  staleTime: 30_000,
  gcTime: 5 * 60_000,
} as const

const MAX_QUERY_RETRIES = 2

export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_QUERY_RETRIES || !(error instanceof AppError)) {
    return false
  }

  return error.kind === 'network' || (error.kind === 'http' && (error.status ?? 0) >= 500)
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        ...queryCacheDefaults,
        retry: shouldRetryQuery,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

export const queryClient = createQueryClient()
