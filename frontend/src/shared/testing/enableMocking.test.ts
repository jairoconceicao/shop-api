import { describe, expect, it } from 'vitest'
import { isMockingEnabled } from './enableMocking'

describe('isMockingEnabled', () => {
  it('enables browser mocks only in development with explicit opt-in', () => {
    expect(isMockingEnabled({ DEV: true, VITE_ENABLE_MSW: 'true' })).toBe(true)
  })

  it.each([
    { DEV: false, VITE_ENABLE_MSW: 'true' },
    { DEV: true, VITE_ENABLE_MSW: 'false' },
    { DEV: true },
  ])('keeps browser mocks disabled for %o', (environment) => {
    expect(isMockingEnabled(environment)).toBe(false)
  })
})
