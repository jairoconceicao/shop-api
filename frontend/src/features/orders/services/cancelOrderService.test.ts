import { describe, expect, it, vi } from 'vitest'

import { cancelOrder } from './cancelOrderService'

const { request } = vi.hoisted(() => ({ request: vi.fn() }))
vi.mock('../../../shared/api/apiClient', () => ({ apiClient: { request } }))

describe('cancelOrder', () => {
  it('PATCHes only Cancelado with auth and adapts the response', async () => {
    request.mockResolvedValue({
      status: true,
      data: { pedidoId: 41, clienteId: 7, dataPedido: '2026-07-15T12:00:00Z', status: 'Cancelado' },
    })

    await expect(cancelOrder({ orderId: 41, token: 'token' })).resolves.toMatchObject({
      id: 41,
      customerId: 7,
      status: 'Cancelado',
    })
    expect(request).toHaveBeenCalledWith('/api/v1/pedido/41', {
      method: 'PATCH',
      token: 'token',
      body: { status: 'Cancelado' },
      signal: undefined,
    })
  })

  it('rejects a malformed cancellation envelope', async () => {
    request.mockResolvedValue({ status: true, data: null })
    await expect(cancelOrder({ orderId: 41, token: 'token' })).rejects.toThrow()
  })
})
