import { describe, expect, it } from 'vitest'

import { getInternalReturnTo } from './returnTo'

describe('getInternalReturnTo', () => {
  it.each([
    ['/checkout?etapa=pagamento#resumo', '/checkout?etapa=pagamento#resumo'],
    ['https://malicioso.example/roubo', '/'],
    ['//malicioso.example/roubo', '/'],
    ['/\\malicioso.example/roubo', '/'],
    ['javascript:alert(1)', '/'],
    [undefined, '/'],
  ])('normalizes %s to an internal destination', (returnTo, expected) => {
    expect(getInternalReturnTo({ returnTo })).toBe(expected)
  })
})
