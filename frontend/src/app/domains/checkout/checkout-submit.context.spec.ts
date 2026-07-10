import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { OrderService } from '@core/order/order.service';
import { NormalizedApiError } from '@shared/api/api-error.model';
import type { CartItem } from '@shared/models';

import { createCheckoutSubmitState } from './checkout-submit.context';

describe('createCheckoutSubmitState', () => {
  const deliveryAddress = signal({
    logradouro: 'Rua Central',
    numero: '100',
    complemento: 'Apto 12',
    cep: '01001000',
    bairro: 'Centro',
    cidade: 'Sao Paulo',
    uf: 'SP',
  });
  const paymentMethod = signal<'Pix' | 'Cartao' | 'Boleto'>('Pix');
  const items = signal<readonly CartItem[]>([
    {
      itemId: 1,
      produtoId: 10,
      quantidade: 2,
      valorUnitario: 199.9,
    },
  ]);

  it('blocks submission and reports an empty cart error', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: OrderService,
          useValue: {
            create: vi.fn(),
          },
        },
      ],
    });

    const state = TestBed.runInInjectionContext(() => createCheckoutSubmitState());

    state.submit({
      deliveryAddress,
      paymentMethod,
      items: signal([]),
    });

    expect(state.error()).toBe('Seu carrinho está vazio. Adicione produtos antes de continuar.');
    expect(state.fieldErrors()).toEqual([]);
  });

  it('surfaces validation field errors returned by the API', () => {
    const orderServiceMock = {
      create: vi.fn().mockReturnValue(
        throwError(
          () =>
            new NormalizedApiError({
              status: 422,
              code: 'VALIDATION_ERROR',
              message: 'Campos invalidos no pedido.',
              details: {
                enderecoEntrega: ['CEP invalido.'],
                formaPagamento: ['Forma de pagamento obrigatoria.'],
              },
            }),
        ),
      ),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: OrderService, useValue: orderServiceMock }],
    });

    const state = TestBed.runInInjectionContext(() => createCheckoutSubmitState());

    state.submit({
      deliveryAddress,
      paymentMethod,
      items,
    });

    expect(state.error()).toBe('Revise os campos destacados e tente novamente.');
    expect(state.fieldErrors()).toEqual(['CEP invalido.', 'Forma de pagamento obrigatoria.']);
  });

  it('surfaces a product availability error when the backend rejects the order', () => {
    const orderServiceMock = {
      create: vi.fn().mockReturnValue(
        throwError(
          () =>
            new NormalizedApiError({
              status: 409,
              code: 'CONFLICT',
              message: 'Produto sem estoque suficiente.',
              details: null,
            }),
        ),
      ),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: OrderService, useValue: orderServiceMock }],
    });

    const state = TestBed.runInInjectionContext(() => createCheckoutSubmitState());

    state.submit({
      deliveryAddress,
      paymentMethod: signal('Pix'),
      items,
    });

    expect(state.error()).toBe('Alguns produtos ficaram indisponíveis ou sem estoque. Atualize o carrinho e tente novamente.');
    expect(state.fieldErrors()).toEqual([]);
  });

  it('stores the created order when submission succeeds', () => {
    const orderServiceMock = {
      create: vi.fn().mockReturnValue(
        of({
          pedidoId: 9999,
          clienteId: 20,
          dataPedido: '2026-07-10T12:00:00-03:00',
          formaPagamento: 'Pix',
          status: 'Criado',
          valorTotal: 399.9,
        }),
      ),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: OrderService, useValue: orderServiceMock }],
    });

    const state = TestBed.runInInjectionContext(() => createCheckoutSubmitState());

    state.submit({
      deliveryAddress,
      paymentMethod,
      items,
    });

    expect(state.success()).toBe(true);
    expect(state.createdOrder()?.pedidoId).toBe(9999);
    expect(state.error()).toBeNull();
    expect(state.fieldErrors()).toEqual([]);
  });
});
