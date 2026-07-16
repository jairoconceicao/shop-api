import { describe, expect, it } from 'vitest'

import { formatCurrency } from './currency'

describe('formatCurrency', () => {
  it.each([
    [0, 'R$\u00a00,00'],
    [-12.5, '-R$\u00a012,50'],
    [1234.56, 'R$\u00a01.234,56'],
  ] as const)('formats %s in pt-BR', (value, expected) => {
    expect(formatCurrency(value)).toBe(expected)
  })
})
