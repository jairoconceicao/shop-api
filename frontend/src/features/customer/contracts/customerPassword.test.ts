import { describe, expect, it } from 'vitest'

import {
  adaptCustomerPasswordRequest,
  passwordRuleResults,
} from './customerPassword'

describe('customer password contract', () => {
  it.each([
    ['Abcdef1!', { minLength: true, uppercase: true, number: true, special: true }],
    ['Abc1!', { minLength: false, uppercase: true, number: true, special: true }],
    ['abcdef1!', { minLength: true, uppercase: false, number: true, special: true }],
    ['Abcdefg!', { minLength: true, uppercase: true, number: false, special: true }],
    ['Abcdef12', { minLength: true, uppercase: true, number: true, special: false }],
    ['', { minLength: false, uppercase: false, number: false, special: false }],
  ])('evaluates every password rule for %j', (value, expected) => {
    expect(passwordRuleResults(value)).toEqual(expected)
  })

  it('accepts only current and valid new passwords and preserves their literal values', () => {
    const request = {
      senhaAtual: ' senha atual ',
      senhaNova: ' Abcde1! ',
    }

    expect(adaptCustomerPasswordRequest(request)).toEqual(request)
  })

  it.each([
    { senhaAtual: '', senhaNova: 'Abcdef1!' },
    { senhaAtual: 'Atual1!', senhaNova: 'Abc1!' },
    { senhaAtual: 'Atual1!', senhaNova: 'abcdef1!' },
    { senhaAtual: 'Atual1!', senhaNova: 'Abcdefg!' },
    { senhaAtual: 'Atual1!', senhaNova: 'Abcdef12' },
    { senhaAtual: 'Atual1!', senhaNova: 'Abcdef1!', extra: true },
    { senhaAtual: 'Atual1!', senhaNova: 'Abcdef1!', clienteId: 7 },
  ])('rejects invalid or extra password request values %#', (request) => {
    expect(() => adaptCustomerPasswordRequest(request)).toThrow()
  })
})
