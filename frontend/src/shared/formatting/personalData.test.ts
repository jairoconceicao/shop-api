import { describe, expect, it } from 'vitest'

import {
  formatCellPhone,
  formatCpf,
  formatPostalCode,
  normalizeCellPhone,
  normalizeCpf,
  normalizePostalCode,
  splitCellPhone,
} from './personalData'

describe('CPF presentation and normalization', () => {
  it.each([
    ['', ''],
    ['1', '1'],
    ['1234', '123.4'],
    ['1234567', '123.456.7'],
    ['12345678901', '123.456.789-01'],
  ])('formats progressive input %s', (input, expected) => {
    expect(formatCpf(input)).toBe(expected)
  })

  it('removes presentation characters and limits the normalized value', () => {
    expect(normalizeCpf('123.456.789-01 extra 99')).toBe('12345678901')
  })
})

describe('postal code presentation and normalization', () => {
  it.each([
    ['', ''],
    ['12345', '12345'],
    ['123456', '12345-6'],
    ['12345-678', '12345-678'],
  ])('formats progressive input %s', (input, expected) => {
    expect(formatPostalCode(input)).toBe(expected)
  })

  it('removes presentation characters and limits the normalized value', () => {
    expect(normalizePostalCode('12345-678 99')).toBe('12345678')
  })
})

describe('cell phone presentation and normalization', () => {
  it.each([
    ['', ''],
    ['1', '(1'],
    ['11', '(11'],
    ['119', '(11) 9'],
    ['1191234', '(11) 9123-4'],
    ['1131234567', '(11) 3123-4567'],
    ['11912345678', '(11) 91234-5678'],
  ])('formats progressive input %s', (input, expected) => {
    expect(formatCellPhone(input)).toBe(expected)
  })

  it('removes presentation characters and limits the normalized value', () => {
    expect(normalizeCellPhone('(11) 91234-5678 extra 99')).toBe('11912345678')
  })

  it('splits the normalized value into the request contract fields', () => {
    expect(splitCellPhone('(11) 91234-5678')).toEqual({
      ddd: '11',
      numero: '912345678',
    })
  })
})
