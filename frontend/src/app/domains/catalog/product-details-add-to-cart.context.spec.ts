import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { CartService } from '@core/cart/cart.service';
import { CartStore } from '@domains/cart/cart.store';
import type { ProductDetails } from '@shared/models';

import { createProductDetailsAddToCartState } from './product-details-add-to-cart.context';

describe('createProductDetailsAddToCartState', () => {
  const product = (overrides: Partial<ProductDetails> = {}): ProductDetails => ({
    produtoId: 101,
    titulo: 'Notebook Gamer',
    descricao: 'Notebook para jogos',
    modelo: 'RTX',
    foto: null,
    preco: 2999.95,
    estoque: 12,
    categoria: {
      categoriaId: 1,
      titulo: 'Informática',
    },
    ...overrides,
  });

  it('adds a product item without carrinhoId and updates the cart store', () => {
    const cartServiceMock = {
      addItem: vi.fn().mockReturnValue(of({ itemId: 77 })),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: CartService, useValue: cartServiceMock },
        CartStore,
      ],
    });

    const state = TestBed.runInInjectionContext(() =>
      createProductDetailsAddToCartState(signal(product())),
    );

    state.addToCart();

    expect(cartServiceMock.addItem).toHaveBeenCalledWith({
      produtoId: 101,
      quantidade: 1,
      valorUnitario: 2999.95,
    });

    const cartStore = TestBed.inject(CartStore);

    expect(cartStore.items()).toEqual([
      {
        itemId: 77,
        produtoId: 101,
        quantidade: 1,
        valorUnitario: 2999.95,
      },
    ]);
    expect(state.success()).toBe(true);
    expect(state.error()).toBeNull();
  });

  it('blocks addition when the product has no stock', () => {
    const cartServiceMock = {
      addItem: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: CartService, useValue: cartServiceMock },
        CartStore,
      ],
    });

    const state = TestBed.runInInjectionContext(() =>
      createProductDetailsAddToCartState(signal(product({ estoque: 0 }))),
    );

    state.addToCart();

    expect(cartServiceMock.addItem).not.toHaveBeenCalled();
    expect(state.canAddToCart()).toBe(false);
  });

  it('surfaces an error when the API call fails', () => {
    const cartServiceMock = {
      addItem: vi.fn().mockReturnValue(throwError(() => new Error('failed to add item'))),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: CartService, useValue: cartServiceMock },
        CartStore,
      ],
    });

    const state = TestBed.runInInjectionContext(() =>
      createProductDetailsAddToCartState(signal(product())),
    );

    state.addToCart();

    expect(state.success()).toBe(false);
    expect(state.error()).toBe('Não foi possível adicionar o item ao carrinho. Tente novamente.');
  });
});
