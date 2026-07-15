import { describe, expect, it } from 'vitest'

import {
  adaptCancelledOrderResponse,
  adaptOrderResponse,
  adaptOrdersPage,
  createCancelOrderRequest,
} from './orders'
import { orderQueryKeys } from '../cache/orderQueryKeys'

const validAddress = {
  logradouro: 'Rua das Flores',
  numero: '123',
  complemento: null,
  cep: '12345678',
  bairro: 'Centro',
  cidade: 'Sao Paulo',
  uf: 'SP',
}

const validOrder = {
  pedidoId: '41',
  carrinhoId: '9',
  clienteId: '7',
  enderecoEntrega: validAddress,
  dataPedido: '2026-07-15T12:00:00Z',
  formaPagamento: 'Pix',
  status: 'Criado',
  items: [
    { itemId: '3', produtoId: '5', quantidade: '2', valorUnitario: '10.5' },
  ],
}

function responseWith(order: Record<string, unknown>) {
  return { status: true, data: { ...validOrder, ...order } }
}

describe('adaptOrdersPage', () => {
  it('normalizes a paged order response and derives no transport total', () => {
    const page = adaptOrdersPage({
      status: true,
      pagination: {
        pages: '2',
        size: '20',
        totalItems: '21',
        data: [validOrder],
      },
    })

    expect(page).toMatchObject({ pages: 2, size: 20, totalItems: 21 })
    expect(page.orders[0].items[0]).toEqual({
      itemId: 3,
      productId: 5,
      quantity: 2,
      unitPrice: 10.5,
    })
    expect(page.orders[0]).not.toHaveProperty('total')
  })

  it.each([
    null,
    { status: false, pagination: { pages: 1, size: 20, totalItems: 0, data: [] } },
    { status: true, pagination: null },
    { status: true, pagination: { pages: -1, size: 20, totalItems: 0, data: [] } },
    { status: true, pagination: { pages: 1, size: 0, totalItems: 0, data: [] } },
  ])('rejects invalid pagination envelope %#', (response) => {
    expect(() => adaptOrdersPage(response)).toThrow()
  })
})

describe('adaptOrderResponse', () => {
  it('normalizes a successful order detail response', () => {
    expect(adaptOrderResponse(responseWith({ status: 'Devolvido' }))).toEqual({
      id: 41,
      cartId: 9,
      customerId: 7,
      deliveryAddress: validAddress,
      createdAt: '2026-07-15T12:00:00Z',
      paymentMethod: 'Pix',
      status: 'Devolvido',
      items: [{ itemId: 3, productId: 5, quantity: 2, unitPrice: 10.5 }],
    })
  })

  it.each(['Pendente', '', null])('rejects unknown status %p', (status) => {
    expect(() => adaptOrderResponse(responseWith({ status }))).toThrow()
  })

  it.each([
    ['zero ID', { pedidoId: 0 }],
    ['negative ID', { carrinhoId: -1 }],
    ['unsafe ID', { clienteId: Number.MAX_SAFE_INTEGER + 1 }],
    ['negative quantity', { items: [{ ...validOrder.items[0], quantidade: -1 }] }],
    ['non-finite unit price', { items: [{ ...validOrder.items[0], valorUnitario: Infinity }] }],
    ['unknown property', { extra: true }],
  ])('rejects %s', (_case, changes) => {
    expect(() => adaptOrderResponse(responseWith(changes))).toThrow()
  })

  it.each([{}, { status: true, data: null }, { status: false, data: validOrder }])(
    'rejects a response without successful non-null data',
    (response) => {
      expect(() => adaptOrderResponse(response)).toThrow()
    },
  )
})

describe('order cancellation contracts', () => {
  it('creates the only supported cancellation payload', () => {
    expect(createCancelOrderRequest()).toEqual({ status: 'Cancelado' })
    expect(Object.keys(createCancelOrderRequest())).toEqual(['status'])
  })

  it('normalizes a successful cancellation response', () => {
    expect(adaptCancelledOrderResponse({
      status: true,
      data: {
        pedidoId: '41',
        clienteId: '7',
        dataPedido: '2026-07-15T12:00:00Z',
        status: 'Cancelado',
      },
    })).toEqual({
      id: 41,
      customerId: 7,
      createdAt: '2026-07-15T12:00:00Z',
      status: 'Cancelado',
    })
  })

  it.each([
    { status: true, data: null },
    { status: false, data: { pedidoId: 41 } },
    {
      status: true,
      data: {
        pedidoId: 41,
        clienteId: 7,
        dataPedido: '2026-07-15T12:00:00Z',
        status: 'Processado',
      },
    },
  ])('rejects an invalid cancellation response', (response) => {
    expect(() => adaptCancelledOrderResponse(response)).toThrow()
  })
})

describe('orderQueryKeys', () => {
  it('scopes list and detail keys by private customer data', () => {
    expect(orderQueryKeys.all).toEqual(['private', 'orders'])
    expect(orderQueryKeys.lists(7)).toEqual(['private', 'orders', 'list', 7])
    expect(orderQueryKeys.list(7, undefined, undefined, 2, 20)).toEqual([
      'private', 'orders', 'list', 7, null, null, 2, 20,
    ])
    expect(orderQueryKeys.details(7)).toEqual(['private', 'orders', 'detail', 7])
    expect(orderQueryKeys.detail(7, 41)).toEqual([
      'private', 'orders', 'detail', 7, 41,
    ])
  })
})
