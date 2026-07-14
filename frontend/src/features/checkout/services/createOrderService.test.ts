import { describe, expect, it, vi } from 'vitest'

import { AppError } from '../../../shared/errors/appError'
import type { CreateOrderRequest } from '../contracts/order'
import { createOrder } from './createOrderService'

const input: Omit<CreateOrderRequest, 'dataPedido'> = {
  enderecoEntrega: {
    logradouro: 'Rua das Flores',
    numero: '123',
    complemento: null,
    cep: '12345678',
    bairro: 'Centro',
    cidade: 'Sao Paulo',
    uf: 'SP',
  },
  formaPagamento: 'Pix',
  items: [
    { itemId: 7, produtoId: 42, quantidade: 2, valorUnitario: 19.9 },
  ],
}

const response = {
  status: true,
  message: 'Pedido criado.',
  data: {
    pedidoId: '101',
    clienteId: '11',
    dataPedido: '2026-07-14T15:30:00.000Z',
    formaPagamento: 'Pix',
    status: 'Criado',
    valorTotal: '39.80',
  },
}

describe('createOrder', () => {
  it('posts the strict request with a timestamp generated for each authenticated call', async () => {
    const signal = new AbortController().signal
    const client = { request: vi.fn().mockResolvedValue(response) }
    const now = vi.fn()
      .mockReturnValueOnce(new Date('2026-07-14T15:30:00.000Z'))
      .mockReturnValueOnce(new Date('2026-07-14T15:31:00.000Z'))

    await expect(createOrder(input, 'access-token', now, signal, client)).resolves.toEqual({
      id: 101,
      customerId: 11,
      createdAt: '2026-07-14T15:30:00.000Z',
      paymentMethod: 'Pix',
      status: 'Criado',
      total: 39.8,
    })
    await createOrder(input, 'access-token', now, signal, client)

    expect(now).toHaveBeenCalledTimes(2)
    expect(client.request).toHaveBeenNthCalledWith(1, '/api/v1/pedido', {
      method: 'POST',
      token: 'access-token',
      signal,
      body: { ...input, dataPedido: '2026-07-14T15:30:00.000Z' },
    })
    expect(client.request).toHaveBeenNthCalledWith(2, '/api/v1/pedido', {
      method: 'POST',
      token: 'access-token',
      signal,
      body: { ...input, dataPedido: '2026-07-14T15:31:00.000Z' },
    })
  })

  it('rejects unknown request properties before sending', async () => {
    const client = { request: vi.fn() }
    const invalidInput = { ...input, clienteId: 11 }

    await expect(createOrder(invalidInput, 'access-token', () => new Date(), undefined, client))
      .rejects.toMatchObject({ kind: 'contract' } satisfies Partial<AppError>)
    expect(client.request).not.toHaveBeenCalled()
  })

  it('maps an invalid successful response to a contract error', async () => {
    const client = { request: vi.fn().mockResolvedValue({ status: true, data: null }) }

    await expect(createOrder(input, 'access-token', () => new Date(), undefined, client))
      .rejects.toMatchObject({ kind: 'contract' } satisfies Partial<AppError>)
  })

  it('preserves errors already normalized by the API client', async () => {
    const error = new AppError({ kind: 'http', status: 422, message: 'Pedido invalido.' })
    const client = { request: vi.fn().mockRejectedValue(error) }

    await expect(createOrder(input, 'access-token', () => new Date(), undefined, client))
      .rejects.toBe(error)
  })
})
