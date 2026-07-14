import { describe, expect, it } from 'vitest'

import { parseProductId } from './productId'

describe('parseProductId', () => {
  it.each([
    [undefined],
    [''],
    ['0'],
    ['-1'],
    ['1.5'],
    ['01'],
    ['9007199254740992'],
  ])('rejects a non-canonical product id: %s', (value) => {
    expect(parseProductId(value)).toBeUndefined()
  })

  it('returns a canonical positive safe integer', () => {
    expect(parseProductId('42')).toBe(42)
    expect(parseProductId(String(Number.MAX_SAFE_INTEGER))).toBe(
      Number.MAX_SAFE_INTEGER,
    )
  })
})
