export interface CatalogUrlState {
  searchword?: string
  categoriaId?: string
  page: number
}

const DEFAULT_PAGE = 1
const CANONICAL_POSITIVE_INTEGER = /^[1-9]\d*$/

function normalizeOptionalValue(value: string | null): string | undefined {
  const normalized = value?.trim()
  return normalized ? normalized : undefined
}

function parsePage(value: string | null): number {
  if (!value || !CANONICAL_POSITIVE_INTEGER.test(value)) {
    return DEFAULT_PAGE
  }

  const page = Number(value)
  return Number.isSafeInteger(page) ? page : DEFAULT_PAGE
}

function normalizePage(page: number): number {
  return Number.isSafeInteger(page) && page >= DEFAULT_PAGE ? page : DEFAULT_PAGE
}

export function parseCatalogUrl(params: URLSearchParams): CatalogUrlState {
  const searchword = normalizeOptionalValue(params.get('searchword'))
  const categoriaId = normalizeOptionalValue(params.get('categoriaId'))

  return {
    ...(searchword ? { searchword } : {}),
    ...(categoriaId ? { categoriaId } : {}),
    page: parsePage(params.get('page')),
  }
}

export function serializeCatalogUrl(state: CatalogUrlState): URLSearchParams {
  const params = new URLSearchParams()
  const searchword = normalizeOptionalValue(state.searchword ?? null)
  const categoriaId = normalizeOptionalValue(state.categoriaId ?? null)
  const page = normalizePage(state.page)

  if (searchword) params.set('searchword', searchword)
  if (categoriaId) params.set('categoriaId', categoriaId)
  if (page !== DEFAULT_PAGE) params.set('page', String(page))

  return params
}
