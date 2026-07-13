import { describe, expect, it } from 'vitest'

import { parseEnvironment } from './environment'

describe('parseEnvironment', () => {
  it.each(['development', 'test', 'production'] as const)(
    'accepts the %s application environment',
    (mode) => {
      expect(
        parseEnvironment({
          MODE: mode,
          VITE_API_BASE_URL: 'http://localhost:8080/api/v1',
        }),
      ).toEqual({
        MODE: mode,
        VITE_API_BASE_URL: 'http://localhost:8080/api/v1',
      })
    },
  )

  it.each([
    { MODE: 'staging', VITE_API_BASE_URL: 'https://api.example.com' },
    { MODE: 'production', VITE_API_BASE_URL: 'not-a-url' },
    { MODE: 'production', VITE_API_BASE_URL: 'ftp://api.example.com' },
    { MODE: 'production' },
  ])('rejects invalid environment variables: %o', (environment) => {
    expect(() => parseEnvironment(environment)).toThrow()
  })
})
