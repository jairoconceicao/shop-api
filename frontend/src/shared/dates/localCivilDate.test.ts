import { describe, expect, it } from 'vitest'

import { localCivilDate } from './localCivilDate'

describe('localCivilDate', () => {
  it.each([
    [new Date(2026, 0, 1, 0, 0), '2026-01-01'],
    [new Date(2026, 11, 31, 23, 59), '2026-12-31'],
  ])('keeps the local civil day for %s', (date, expected) => {
    expect(localCivilDate(date)).toBe(expected)
  })

  it('does not derive the civil day from UTC', () => {
    const local = new Date(2026, 6, 15, 23, 30)
    expect(localCivilDate(local)).toBe('2026-07-15')
  })

  it('rejects an invalid date without returning NaN text', () => {
    expect(() => localCivilDate(new Date(Number.NaN))).toThrow(RangeError)
  })
})
