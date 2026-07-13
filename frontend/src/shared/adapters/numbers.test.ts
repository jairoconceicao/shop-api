import { describe, expect, it } from 'vitest'

import { normalizeId, normalizeNumber } from './numbers'

describe('normalizeNumber', () => {
  it.each([
    [42, 42],
    ['42', 42],
    ['19.90', 19.9],
    ['-2.5', -2.5],
  ])('normalizes %s to a number', (value, expected) => {
    expect(normalizeNumber(value)).toBe(expected)
  })

  it.each(['', '   ', 'not-a-number', 'Infinity', Infinity, NaN])(
    'rejects the invalid numeric value %s',
    (value) => {
      expect(() => normalizeNumber(value)).toThrow(TypeError)
    },
  )
})

describe('normalizeId', () => {
  it.each([
    [123, 123],
    ['123', 123],
    ['0', 0],
  ])('normalizes the ID %s to a safe integer', (value, expected) => {
    expect(normalizeId(value)).toBe(expected)
  })

  it.each(['1.5', 1.5, '9007199254740992'])(
    'rejects the invalid ID %s',
    (value) => {
      expect(() => normalizeId(value)).toThrow(TypeError)
    },
  )
})
