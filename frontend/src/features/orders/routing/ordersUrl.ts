export type OrdersUrlState = {
  startDate?: string
  endDate?: string
  page: number
}

const civilDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/

function isCivilDate(value: string | null): value is string {
  if (!value) return false
  const match = civilDatePattern.exec(value)
  if (!match) return false
  const [, year, month, day] = match.map(Number)
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

function localBoundary(value: string, boundary: 'start' | 'end'): Date {
  const [year, month, day] = value.split('-').map(Number)
  return boundary === 'start'
    ? new Date(year, month - 1, day, 0, 0, 0, 0)
    : new Date(year, month - 1, day, 23, 59, 59, 999)
}

export function parseOrdersUrl(params: URLSearchParams): OrdersUrlState {
  const startDate = params.get('dataInicio')
  const endDate = params.get('dataFim')
  const rawPage = params.get('page')
  const page = rawPage === null ? 1 : Number(rawPage)

  return {
    ...(isCivilDate(startDate) ? { startDate } : {}),
    ...(isCivilDate(endDate) ? { endDate } : {}),
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
  }
}

export function serializeOrdersUrl(state: OrdersUrlState): URLSearchParams {
  const params = new URLSearchParams()
  if (state.startDate && isCivilDate(state.startDate)) params.set('dataInicio', state.startDate)
  if (state.endDate && isCivilDate(state.endDate)) params.set('dataFim', state.endDate)
  if (Number.isSafeInteger(state.page) && state.page > 1) params.set('page', String(state.page))
  return params
}

export function toOrdersApiPeriod(state: OrdersUrlState) {
  if (state.startDate && state.endDate && state.startDate > state.endDate) {
    throw new RangeError('A data inicial deve ser anterior ou igual à data final.')
  }
  return {
    start: state.startDate ? localBoundary(state.startDate, 'start').toISOString() : undefined,
    end: state.endDate ? localBoundary(state.endDate, 'end').toISOString() : undefined,
  }
}
