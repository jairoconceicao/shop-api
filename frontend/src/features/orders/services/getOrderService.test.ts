import { describe, expect, it, vi } from 'vitest'

import { getOrder } from './getOrderService'

const { request } = vi.hoisted(() => ({ request: vi.fn() }))
vi.mock('../../../shared/api/apiClient', () => ({ apiClient: { request } }))

describe('getOrder', () => {
  it('requests the order with auth and abort signal and adapts it', async () => {
    const signal = new AbortController().signal
    request.mockResolvedValue({
      status: true,
      data: {
        pedidoId: '41', carrinhoId: '9', clienteId: '7', dataPedido: '2026-07-15T12:00:00Z',
        formaPagamento: 'Pix', status: 'Criado',
        enderecoEntrega: { logradouro: 'Rua A', numero: '10', complemento: null, cep: '12345678', bairro: 'Centro', cidade: 'São Paulo', uf: 'SP' },
        items: [{ itemId: '3', produtoId: '5', quantidade: '2', valorUnitario: '12.5' }],
      },
    })

    await expect(getOrder(41, 'token', signal)).resolves.toMatchObject({ id: 41, customerId: 7 })
    expect(request).toHaveBeenCalledWith('/api/v1/pedido/41', { method: 'GET', token: 'token', signal })
  })
})
