import { computed, inject, signal, type Signal } from '@angular/core';
import type { Subscription } from 'rxjs';

import { CartService } from '@core/cart/cart.service';
import { CartStore } from '@domains/cart/cart.store';
import type { ProductDetails } from '@shared/models';

export interface ProductDetailsAddToCartState {
  readonly canAddToCart: Signal<boolean>;
  readonly isAdding: Signal<boolean>;
  readonly error: Signal<string | null>;
  readonly success: Signal<boolean>;
  addToCart(): void;
}

export function createProductDetailsAddToCartState(
  product: Signal<ProductDetails | null>,
): ProductDetailsAddToCartState {
  const cartService = inject(CartService);
  const cartStore = inject(CartStore);
  const isAdding = signal(false);
  const error = signal<string | null>(null);
  const success = signal(false);
  let subscription: Subscription | undefined;

  const addToCart = (): void => {
    const currentProduct = product();

    if (!currentProduct || isAdding() || toNumber(currentProduct.estoque) <= 0) {
      return;
    }

    isAdding.set(true);
    error.set(null);
    success.set(false);
    subscription?.unsubscribe();

    subscription = cartService
      .addItem({
        produtoId: currentProduct.produtoId,
        quantidade: 1,
        valorUnitario: currentProduct.preco,
      })
      .subscribe({
        next: ({ itemId }) => {
          cartStore.addItem({
            itemId,
            produtoId: currentProduct.produtoId,
            quantidade: 1,
            valorUnitario: currentProduct.preco,
          });
          success.set(true);
          isAdding.set(false);
        },
        error: () => {
          error.set('Não foi possível adicionar o item ao carrinho. Tente novamente.');
          isAdding.set(false);
        },
      });
  };

  return {
    canAddToCart: computed(() => {
      const currentProduct = product();
      return currentProduct !== null && toNumber(currentProduct.estoque) > 0;
    }),
    isAdding,
    error,
    success,
    addToCart,
  };
}

function toNumber(value: number | string): number {
  const result = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(result) ? result : 0;
}
