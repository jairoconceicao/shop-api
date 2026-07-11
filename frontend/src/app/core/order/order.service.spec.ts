import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { ApiClientService } from '@shared/api';
import type { CreateOrderRequest, Order } from '@shared/models';

import { OrderService } from './order.service';

describe('OrderService', () => {
  const orderFixture: Order = {
    pedidoId: 9999,
    carrinhoId: 100,
    clienteId: 20,
    enderecoEntrega: {
      logradouro: 'Rua Central',
      numero: '100',
      complemento: null,
      cep: '01001000',
      bairro: 'Centro',
      cidade: 'Sao Paulo',
      uf: 'SP',
    },
    dataPedido: '2026-07-10T12:00:00-03:00',
    formaPagamento: 'Pix',
    status: 'Criado',
    items: [
      {
        itemId: 1,
        produtoId: 10,
        quantidade: 2,
        valorUnitario: 199.9,
      },
    ],
  };

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

  it('lists orders by cpf with pagination and normalizes the response', () => {
    const apiClient = {
      get: vi.fn().mockReturnValue(
        of({
          status: true,
          message: '',
          pagination: {
            pages: 3,
            size: 20,
            totalItems: 50,
            data: [orderFixture],
          },
        }),
      ),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: ApiClientService, useValue: apiClient }],
    });

    const service = TestBed.inject(OrderService);

    service
      .list({ cpf: '12345678901', page: 1, size: 20 })
      .subscribe((result) => {
        expect(result.pages).toBe(3);
        expect(result.totalItems).toBe(50);
        expect(result.data).toEqual([orderFixture]);
      });

    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/pedido', {
      params: {
        cpf: '12345678901',
        page: 1,
        size: 20,
        dataInicio: undefined,
        dataFim: undefined,
      },
    });
  });

  it('gets order detail by id and normalizes the response', () => {
    const apiClient = {
      get: vi.fn().mockReturnValue(
        of({
          status: true,
          message: '',
          data: orderFixture,
        }),
      ),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: ApiClientService, useValue: apiClient }],
    });

    const service = TestBed.inject(OrderService);

    service.getById(9999).subscribe((result) => {
      expect(result.pedidoId).toBe(9999);
      expect(result.status).toBe('Criado');
    });

    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/pedido/9999');
  });

  it('cancels an order sending status Cancelado and normalizes the response', () => {
    const apiClient = {
      patch: vi.fn().mockReturnValue(
        of({
          status: true,
          message: '',
          data: {
            pedidoId: 9999,
            clienteId: 20,
            dataPedido: '2026-07-10T12:00:00-03:00',
            status: 'Cancelado',
          },
        }),
      ),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: ApiClientService, useValue: apiClient }],
    });

    const service = TestBed.inject(OrderService);

    service.cancel(9999).subscribe((result) => {
      expect(result.pedidoId).toBe(9999);
      expect(result.status).toBe('Cancelado');
    });

    expect(apiClient.patch).toHaveBeenCalledWith('/api/v1/pedido/9999', {
      status: 'Cancelado',
    });
  });
});
