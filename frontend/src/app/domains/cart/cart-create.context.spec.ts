import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { CartService } from '@core/cart/cart.service';

import { createCartCreationContext } from './cart-create.context';

describe('createCartCreationContext', () => {
  it('creates the cart once and stores the returned identifier', () => {
    const cartServiceMock = {
      create: vi.fn().mockReturnValue(of({ carrinhoId: 42 })),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: CartService, useValue: cartServiceMock }],
    });

    const state = TestBed.runInInjectionContext(() => createCartCreationContext());

    state.create();
    state.create();

    expect(cartServiceMock.create).toHaveBeenCalledTimes(1);
    expect(state.isLoading()).toBe(false);
    expect(state.error()).toBeNull();
    expect(state.createdCartId()).toBe(42);
  });

  it('surfaces an error when cart creation fails', () => {
    const cartServiceMock = {
      create: vi.fn().mockReturnValue(throwError(() => new Error('failed to create cart'))),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: CartService, useValue: cartServiceMock }],
    });

    const state = TestBed.runInInjectionContext(() => createCartCreationContext());

    state.create();

    expect(state.isLoading()).toBe(false);
    expect(state.error()).toBe('Não foi possível criar o carrinho. Tente novamente.');
    expect(state.createdCartId()).toBeNull();
  });
});
