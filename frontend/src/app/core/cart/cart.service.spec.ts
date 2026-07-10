import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ApiClientService } from '@shared/api';

import { CartService } from './cart.service';

describe('CartService', () => {
  it('creates a cart without sending a payload and normalizes the response', () => {
    const apiClient = { post: vi.fn().mockReturnValue(of({
      data: { carrinhoId: 42, dataCarrinho: '2026-07-10T12:00:00Z' },
      status: 201,
      message: 'Carrinho criado',
    })) };
    TestBed.configureTestingModule({ providers: [{ provide: ApiClientService, useValue: apiClient }] });

    TestBed.inject(CartService).create().subscribe((cart) => {
      expect(cart).toEqual({ carrinhoId: 42, dataCarrinho: '2026-07-10T12:00:00Z' });
    });

    expect(apiClient.post).toHaveBeenCalledWith('/api/v1/carrinho/criar', undefined);
  });

  it('gets a cart by id and normalizes the response', () => {
    const apiClient = { get: vi.fn().mockReturnValue(of({
      data: {
        clienteId: 7,
        carrinhoId: 42,
        dataCarrinho: '2026-07-10T12:00:00Z',
        items: [{ itemId: 1, produtoId: 9, quantidade: 2, valorUnitario: 15.5 }],
      },
      status: 200,
      message: '',
    })) };
    TestBed.configureTestingModule({ providers: [{ provide: ApiClientService, useValue: apiClient }] });

    TestBed.inject(CartService).getById(42).subscribe((cart) => {
      expect(cart.carrinhoId).toBe(42);
      expect(cart.items).toHaveLength(1);
    });

    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/carrinho/42');
  });
});
