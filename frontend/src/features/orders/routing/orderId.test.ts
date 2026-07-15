import { describe, expect, it } from 'vitest'

import { parseOrderId } from './orderId'

describe('parseOrderId', () => {
  it('parses a canonical positive safe integer', () => {
    expect(parseOrderId('41')).toBe(41)
  })

  it.each(['0', '-1', '01', '1.5', '9007199254740992', undefined])('rejects invalid order id %p', (value) => {
    expect(parseOrderId(value)).toBeUndefined()
  })
})
