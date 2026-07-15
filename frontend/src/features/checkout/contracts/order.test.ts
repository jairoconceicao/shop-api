import { describe, expect, it } from 'vitest'

import {
  adaptCreateOrderRequest,
  adaptCreatedOrderResponse,
} from './order'

const deliveryAddress = {
  logradouro: 'Rua das Flores',
  numero: '123',
  complemento: null,
  cep: '12345678',
  bairro: 'Centro',
  cidade: 'Sao Paulo',
  uf: 'SP',
}

const validRequest = {
  enderecoEntrega: deliveryAddress,
  formaPagamento: 'Pix',
  dataPedido: '2026-07-14T15:30:00.000Z',
  items: [
    { itemId: '7', produtoId: '42', quantidade: '2', valorUnitario: '19.90' },
  ],
}

describe('adaptCreateOrderRequest', () => {
  it('produces the exact request root and normalizes every item number', () => {
    expect(adaptCreateOrderRequest(validRequest)).toEqual({
      enderecoEntrega: deliveryAddress,
      formaPagamento: 'Pix',
      dataPedido: '2026-07-14T15:30:00.000Z',
      items: [
        { itemId: 7, produtoId: 42, quantidade: 2, valorUnitario: 19.9 },
      ],
    })
  })

  it.each(['clienteId', 'carrinhoId', 'extra'])('rejects unknown root property %s', (key) => {
    expect(() => adaptCreateOrderRequest({ ...validRequest, [key]: 99 })).toThrow()
  })

  it('does not omit itemId', () => {
    const itemWithoutId = { produtoId: 42, quantidade: 2, valorUnitario: 19.9 }

    expect(() => adaptCreateOrderRequest({ ...validRequest, items: [itemWithoutId] })).toThrow()
  })

  it('rejects unknown item properties', () => {
    const item = { ...validRequest.items[0], titulo: 'Campo visual' }

    expect(() => adaptCreateOrderRequest({ ...validRequest, items: [item] })).toThrow()
  })
})

describe('adaptCreatedOrderResponse', () => {
  it('adapts a successful 201 response and normalizes numeric transport values', () => {
    expect(adaptCreatedOrderResponse({
      status: true,
      message: 'Pedido criado.',
      data: {
        pedidoId: '101',
        clienteId: '11',
        dataPedido: '2026-07-14T15:30:00Z',
        formaPagamento: 'Pix',
        status: 'Criado',
        valorTotal: '39.80',
      },
    })).toEqual({
      id: 101,
      customerId: 11,
      createdAt: '2026-07-14T15:30:00Z',
      paymentMethod: 'Pix',
      status: 'Criado',
      total: 39.8,
    })
  })

  it.each([
    {},
    { status: true, data: null },
    { status: false, data: { pedidoId: 101 } },
  ])('rejects a response without successful order data', (response) => {
    expect(() => adaptCreatedOrderResponse(response)).toThrow()
  })

  it('uses the canonical order statuses', () => {
    const response = {
      status: true,
      data: {
        pedidoId: 101,
        clienteId: 11,
        dataPedido: '2026-07-14T15:30:00Z',
        formaPagamento: 'Pix',
        status: 'Devolvido',
        valorTotal: 39.8,
      },
    }

    expect(adaptCreatedOrderResponse(response).status).toBe('Devolvido')
    expect(() => adaptCreatedOrderResponse({
      ...response,
      data: { ...response.data, status: 'Pendente' },
    })).toThrow()
  })

  it.each([
    ['zero order ID', { pedidoId: 0 }],
    ['unsafe customer ID', { clienteId: Number.MAX_SAFE_INTEGER + 1 }],
    ['negative total', { valorTotal: -1 }],
    ['non-finite total', { valorTotal: Infinity }],
  ])('rejects %s in a created order response', (_case, changes) => {
    expect(() => adaptCreatedOrderResponse({
      status: true,
      data: {
        pedidoId: 101,
        clienteId: 11,
        dataPedido: '2026-07-14T15:30:00Z',
        formaPagamento: 'Pix',
        status: 'Criado',
        valorTotal: 39.8,
        ...changes,
      },
    })).toThrow()
  })
})
