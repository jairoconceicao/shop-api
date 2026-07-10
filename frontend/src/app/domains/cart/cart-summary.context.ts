import { computed, inject, type Signal } from '@angular/core';

import type { EntityId } from '@shared/models';

import { CartStore } from './cart.store';

export interface CartSummaryState {
  readonly subtotal: Signal<number>;
  readonly shipping: Signal<number>;
  readonly total: Signal<number>;
  updateQuantity(produtoId: EntityId, quantidade: number): void;
  removeItem(itemId: EntityId): void;
}

export function createCartSummaryState(): CartSummaryState {
  const cartStore = inject(CartStore);

  return {
    subtotal: cartStore.subtotal,
    shipping: computed(() => 0),
    total: computed(() => cartStore.subtotal() + 0),
    updateQuantity: (produtoId: EntityId, quantidade: number): void => {
      cartStore.updateQuantity(produtoId, quantidade);
    },
    removeItem: (itemId: EntityId): void => {
      cartStore.removeItem(itemId);
    },
  };
}
