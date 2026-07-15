import { describe, expect, it } from 'vitest'
import { parseOrdersUrl, serializeOrdersUrl, toOrdersApiPeriod } from './ordersUrl'

describe('ordersUrl', () => {
  it('round-trips valid civil dates and omits the first page', () => {
    const state = parseOrdersUrl(new URLSearchParams('dataInicio=2026-07-01&dataFim=2026-07-15&page=3'))

    expect(state).toEqual({ startDate: '2026-07-01', endDate: '2026-07-15', page: 3 })
    expect(serializeOrdersUrl({ ...state, page: 1 }).toString()).toBe('dataInicio=2026-07-01&dataFim=2026-07-15')
  })

  it.each([
    ['dataInicio=2026-02-30&dataFim=not-a-date&page=0'],
    ['dataInicio=2026-7-01&page=-2'],
    ['page=1.5'],
    [`page=${Number.MAX_SAFE_INTEGER + 1}`],
  ])('ignores invalid dates and unsafe pages from %s', (query) => {
    expect(parseOrdersUrl(new URLSearchParams(query))).toEqual({ page: 1 })
  })

  it('supports start-only and end-only periods without exposing unrelated filters', () => {
    expect(serializeOrdersUrl({ startDate: '2026-07-01', page: 2 }).toString()).toBe('dataInicio=2026-07-01&page=2')
    expect(serializeOrdersUrl({ endDate: '2026-07-15', page: 1 }).toString()).toBe('dataFim=2026-07-15')
  })

  it('converts inclusive local civil bounds to ISO instants', () => {
    const period = toOrdersApiPeriod({ startDate: '2026-07-01', endDate: '2026-07-15', page: 1 })

    expect(new Date(period.start!).getTime()).toBe(new Date(2026, 6, 1, 0, 0, 0, 0).getTime())
    expect(new Date(period.end!).getTime()).toBe(new Date(2026, 6, 15, 23, 59, 59, 999).getTime())
  })

  it('rejects reversed periods', () => {
    expect(() => toOrdersApiPeriod({ startDate: '2026-07-16', endDate: '2026-07-15', page: 1 })).toThrow(RangeError)
  })
})
