import { describe, expect, it } from 'vitest'

import { AppError } from '../errors/appError'
import { createQueryClient, queryCacheDefaults, shouldRetryQuery } from './queryClient'

describe('shouldRetryQuery', () => {
  it('retries recoverable read failures at most twice', () => {
    const networkError = new AppError({ kind: 'network', message: 'offline' })
    const serverError = new AppError({ kind: 'http', status: 503, message: 'unavailable' })

    expect(shouldRetryQuery(0, networkError)).toBe(true)
    expect(shouldRetryQuery(1, serverError)).toBe(true)
    expect(shouldRetryQuery(2, networkError)).toBe(false)
  })

  it('does not retry client, contract, or unknown failures', () => {
    const notFoundError = new AppError({ kind: 'http', status: 404, message: 'not found' })
    const contractError = new AppError({ kind: 'contract', message: 'invalid response' })

    expect(shouldRetryQuery(0, notFoundError)).toBe(false)
    expect(shouldRetryQuery(0, contractError)).toBe(false)
    expect(shouldRetryQuery(0, new Error('unknown'))).toBe(false)
  })
})

describe('createQueryClient', () => {
  it('configures cache defaults and disables automatic mutation retries', () => {
    const client = createQueryClient()

    expect(client.getDefaultOptions()).toEqual({
      queries: {
        ...queryCacheDefaults,
        retry: shouldRetryQuery,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    })
  })
})
