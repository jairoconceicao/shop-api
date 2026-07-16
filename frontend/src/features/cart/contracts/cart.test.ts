import { describe, expect, it } from 'vitest'

import {
  adaptAddCartItemRequest, adaptAddCartItemResponse, adaptCartResponse,
  adaptCreateCartResponse, adaptDeleteCartItemResponse,
  adaptUpdateCartItemRequest, adaptUpdateCartItemResponse,
} from './cart'

describe('cart requests', () => {
  it('preserves strict Portuguese wire contracts', () => {
    expect(adaptAddCartItemRequest({ produtoId: '42', quantidade: '2.5', valorUnitario: 349.9 }))
      .toEqual({ produtoId: '42', quantidade: '2.5', valorUnitario: 349.9 })
    expect(adaptUpdateCartItemRequest({ quantidade: '3' })).toEqual({ quantidade: '3' })
  })

  it.each([
    { produtoId: 42, quantidade: 1, valorUnitario: 10, carrinhoId: 2 },
    { produtoId: 42, quantidade: Infinity, valorUnitario: 10 },
    { produtoId: '042', quantidade: 1, valorUnitario: 10 },
    { produtoId: 42, quantidade: '.5', valorUnitario: 10 },
  ])('rejects invalid additions', (value) => expect(() => adaptAddCartItemRequest(value)).toThrow())

  it.each([{ quantidade: 1, itemId: 7 }, { quantidade: NaN }, { quantidade: '1e2' }])(
    'rejects invalid updates', (value) => expect(() => adaptUpdateCartItemRequest(value)).toThrow(),
  )
})

describe('cart responses', () => {
  it('rejects extra properties in response data and nested items', () => {
    expect(() => adaptCreateCartResponse({ status: true, data: { carrinhoId: 1, dataCarrinho: '2026-07-14T12:30:00Z', extra: true } })).toThrow()
    const data = { clienteId: 12, carrinhoId: 900, dataCarrinho: '2026-07-14T12:30:00Z', items: [{ itemId: 7, produtoId: 42, quantidade: 1, valorUnitario: 10, extra: true }] }
    expect(() => adaptCartResponse({ status: true, data })).toThrow()
  })
  it('normalizes creation', () => {
    expect(adaptCreateCartResponse({ status: true, data: {
      carrinhoId: '900', dataCarrinho: '2026-07-14T12:30:00Z',
    } })).toEqual({ id: 900, createdAt: '2026-07-14T12:30:00Z' })
  })

  it('normalizes the complete cart', () => {
    expect(adaptCartResponse({ status: true, data: {
      clienteId: '12', carrinhoId: 900, dataCarrinho: '2026-07-14T12:30:00-03:00',
      items: [{ itemId: '7', produtoId: 42, quantidade: '2.5', valorUnitario: '349.90' }],
    } })).toEqual({
      customerId: 12, id: 900, createdAt: '2026-07-14T12:30:00-03:00',
      items: [{ id: 7, productId: 42, quantity: 2.5, unitPrice: 349.9 }],
    })
  })

  it('normalizes POST, PATCH and DELETE item responses', () => {
    expect(adaptAddCartItemResponse({ status: true, data: { itemId: '7' } })).toEqual({ itemId: 7 })
    for (const adapter of [adaptUpdateCartItemResponse, adaptDeleteCartItemResponse]) {
      expect(adapter({ status: true, data: { itemId: '7', produtoId: 42 } }))
        .toEqual({ itemId: 7, productId: 42 })
    }
  })

  it.each([
    [adaptCreateCartResponse, {}],
    [adaptCreateCartResponse, { status: true, data: null }],
    [adaptCreateCartResponse, { status: false, data: { carrinhoId: 1, dataCarrinho: '2026-07-14T12:30:00Z' } }],
    [adaptCartResponse, { status: true, data: null }],
    [adaptAddCartItemResponse, { status: true, data: {} }],
    [adaptUpdateCartItemResponse, { status: true, data: { itemId: 7 } }],
    [adaptDeleteCartItemResponse, { status: true, data: { produtoId: 42 } }],
  ] as const)('rejects invalid envelopes', (adapter, value) => expect(() => adapter(value)).toThrow())

  it.each([
    { carrinhoId: 1, dataCarrinho: '14/07/2026' },
    { carrinhoId: '9007199254740992', dataCarrinho: '2026-07-14T12:30:00Z' },
  ])('rejects invalid dates and unsafe IDs', (data) => {
    expect(() => adaptCreateCartResponse({ status: true, data })).toThrow()
  })

  it.each([NaN, Infinity, -Infinity])('rejects non-finite numbers', (quantidade) => {
    expect(() => adaptCartResponse({ status: true, data: {
      clienteId: 12, carrinhoId: 900, dataCarrinho: '2026-07-14T12:30:00Z',
      items: [{ itemId: 7, produtoId: 42, quantidade, valorUnitario: 10 }],
    } })).toThrow()
  })
})
