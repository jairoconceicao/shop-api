import { computed, inject, type Signal } from '@angular/core';

import { CartStore } from '@domains/cart/cart.store';
import type { CartItem } from '@shared/models';

export interface CheckoutState {
  readonly items: Signal<readonly CartItem[]>;
  readonly itemCount: Signal<number>;
  readonly subtotal: Signal<number>;
  readonly shipping: Signal<number>;
  readonly total: Signal<number>;
  readonly isEmpty: Signal<boolean>;
}

export function createCheckoutState(): CheckoutState {
  const cartStore = inject(CartStore);

  return {
    items: cartStore.items,
    itemCount: cartStore.itemCount,
    subtotal: cartStore.subtotal,
    shipping: computed(() => 0),
    total: computed(() => cartStore.subtotal() + 0),
    isEmpty: cartStore.isEmpty,
  };
}
