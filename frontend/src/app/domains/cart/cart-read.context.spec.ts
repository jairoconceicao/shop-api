import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { CartService } from '@core/cart/cart.service';
import { CartStore } from './cart.store';

import { createCartReadContext } from './cart-read.context';

describe('createCartReadContext', () => {
  it('loads the cart and syncs the store items', () => {
    const cartServiceMock = {
      getById: vi.fn().mockReturnValue(
        of({
          carrinhoId: 42,
          dataCarrinho: '2026-07-10T12:00:00Z',
          items: [
            {
              itemId: 1,
              produtoId: 10,
              quantidade: 2,
              valorUnitario: 25,
            },
          ],
        }),
      ),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: CartService, useValue: cartServiceMock },
        CartStore,
      ],
    });

    const carrinhoId = signal<number | null>(42);
    const state = TestBed.runInInjectionContext(() => createCartReadContext(carrinhoId));

    state.load();

    expect(cartServiceMock.getById).toHaveBeenCalledWith(42);
    expect(state.isLoading()).toBe(false);
    expect(state.error()).toBeNull();
    expect(state.cart()).toEqual({
      carrinhoId: 42,
      dataCarrinho: '2026-07-10T12:00:00Z',
      items: [
        {
          itemId: 1,
          produtoId: 10,
          quantidade: 2,
          valorUnitario: 25,
        },
      ],
    });
    expect(TestBed.inject(CartStore).items()).toEqual([
      {
        itemId: 1,
        produtoId: 10,
        quantidade: 2,
        valorUnitario: 25,
      },
    ]);
  });

  it('does not load when there is no active cart id and reports load errors', () => {
    const cartServiceMock = {
      getById: vi.fn().mockReturnValue(throwError(() => new Error('failed to load cart'))),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: CartService, useValue: cartServiceMock },
        CartStore,
      ],
    });

    const emptyCartId = signal<number | null>(null);
    const state = TestBed.runInInjectionContext(() => createCartReadContext(emptyCartId));

    state.load();

    expect(cartServiceMock.getById).not.toHaveBeenCalled();
    expect(state.isLoading()).toBe(false);
    expect(state.error()).toBeNull();

    emptyCartId.set(7);
    state.load();

    expect(cartServiceMock.getById).toHaveBeenCalledWith(7);
    expect(state.error()).toBe('Não foi possível carregar o carrinho. Tente novamente.');
    expect(state.cart()).toBeNull();
  });
});
