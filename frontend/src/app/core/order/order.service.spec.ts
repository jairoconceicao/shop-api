import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { ApiClientService } from '@shared/api';
import type { CreateOrderRequest } from '@shared/models';

import { OrderService } from './order.service';

describe('OrderService', () => {
  it('creates an order sending only the supported checkout fields', () => {
    const apiClient = {
      post: vi.fn().mockReturnValue(
        of({
          status: true,
          message: '',
          data: {
            pedidoId: 9999,
            clienteId: 20,
            dataPedido: '2026-07-10T12:00:00-03:00',
            formaPagamento: 'Pix',
            status: 'Criado',
            valorTotal: 499.7,
          },
        }),
      ),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: ApiClientService, useValue: apiClient }],
    });

    const service = TestBed.inject(OrderService);
    const request = {
      enderecoEntrega: {
        logradouro: 'Rua Central',
        numero: '100',
        complemento: null,
        cep: '01001000',
        bairro: 'Centro',
        cidade: 'Sao Paulo',
        uf: 'SP',
      },
      formaPagamento: 'Pix',
      dataPedido: '2026-07-10T12:00:00-03:00',
      items: [
        {
          itemId: null,
          produtoId: 10,
          quantidade: 2,
          valorUnitario: 199.9,
        },
      ],
    } satisfies CreateOrderRequest;

    service.create(request).subscribe((response) => {
      expect(response.pedidoId).toBe(9999);
    });

    expect(apiClient.post).toHaveBeenCalledWith('/api/v1/pedido', request);
    expect(apiClient.post).toHaveBeenCalledTimes(1);
    expect('clienteId' in request).toBe(false);
    expect('carrinhoId' in request).toBe(false);
  });
});
