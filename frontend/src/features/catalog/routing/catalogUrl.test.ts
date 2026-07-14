import { describe, expect, it } from 'vitest'

import { parseCatalogUrl, serializeCatalogUrl } from './catalogUrl'

describe('parseCatalogUrl', () => {
  it('parses all catalog parameters', () => {
    const result = parseCatalogUrl(new URLSearchParams('searchword=teclado&categoriaId=42&page=3'))
    expect(result).toEqual({ searchword: 'teclado', categoriaId: '42', page: 3 })
  })

  it('uses absent optional values and page one as defaults', () => {
    expect(parseCatalogUrl(new URLSearchParams())).toEqual({ page: 1 })
  })

  it.each(['', '0', '-1', '1.5', '1e2', 'page', '9007199254740992'])(
    'normalizes invalid page %j to page one',
    (page) => expect(parseCatalogUrl(new URLSearchParams({ page })).page).toBe(1),
  )

  it('trims optional values and omits whitespace-only values', () => {
    expect(parseCatalogUrl(new URLSearchParams({ searchword: '  mouse gamer  ', categoriaId: '   ' }))).toEqual({ searchword: 'mouse gamer', page: 1 })
  })

  it('uses the first value for duplicated parameters', () => {
    expect(parseCatalogUrl(new URLSearchParams('searchword=first&searchword=second&categoriaId=10&categoriaId=20&page=2&page=5'))).toEqual({ searchword: 'first', categoriaId: '10', page: 2 })
  })

  it('does not mutate the received URLSearchParams', () => {
    const params = new URLSearchParams('unknown=keep&searchword=%20phone%20&categoriaId=%207%20&page=4')
    const before = params.toString()
    parseCatalogUrl(params)
    expect(params.toString()).toBe(before)
  })

  it('represents search, category, and page independently', () => {
    expect(parseCatalogUrl(new URLSearchParams({ searchword: 'monitor', categoriaId: '8', page: '6' }))).toEqual({ searchword: 'monitor', categoriaId: '8', page: 6 })
  })
})

describe('serializeCatalogUrl', () => {
  it('serializes known parameters in deterministic order', () => {
    expect(serializeCatalogUrl({ searchword: 'notebook', categoriaId: '3', page: 2 }).toString()).toBe('searchword=notebook&categoriaId=3&page=2')
  })

  it('omits empty optional values and the normalized default page', () => {
    expect(serializeCatalogUrl({ searchword: '   ', categoriaId: '', page: 0 }).toString()).toBe('')
  })

  it('discards unknown parameters when producing the canonical URL', () => {
    const parsed = parseCatalogUrl(new URLSearchParams('unknown=value&searchword=ssd&page=2'))
    expect(serializeCatalogUrl(parsed).toString()).toBe('searchword=ssd&page=2')
  })

  it('encodes Unicode, plus signs, ampersands, and spaces via URLSearchParams', () => {
    const serialized = serializeCatalogUrl({ searchword: 'ação + cabo & fonte', categoriaId: 'áudio + vídeo', page: 1 })
    expect(serialized.toString()).toBe('searchword=a%C3%A7%C3%A3o+%2B+cabo+%26+fonte&categoriaId=%C3%A1udio+%2B+v%C3%ADdeo')
  })

  it('round-trips normalized state', () => {
    const state = { searchword: 'fone bluetooth', categoriaId: '12', page: 9 }
    expect(parseCatalogUrl(serializeCatalogUrl(state))).toEqual(state)
  })

  it('canonicalizes whitespace, invalid page, duplicates, and unknown parameters', () => {
    const params = new URLSearchParams('unknown=x&searchword=%20webcam%20&searchword=ignored&categoriaId=%205%20&page=01')
    expect(serializeCatalogUrl(parseCatalogUrl(params)).toString()).toBe('searchword=webcam&categoriaId=5')
  })
})
