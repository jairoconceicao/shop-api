import { DestroyRef, inject, signal, type Signal } from '@angular/core';
import type { Subscription } from 'rxjs';

import { CartService } from '@core/cart/cart.service';
import { CartStore } from './cart.store';
import type { Cart, EntityId } from '@shared/models';

export interface CartReadState {
  readonly cart: Signal<Cart | null>;
  readonly isLoading: Signal<boolean>;
  readonly error: Signal<string | null>;
  load(): void;
  reload(): void;
}

export function createCartReadContext(carrinhoId: Signal<EntityId | null>): CartReadState {
  const destroyRef = inject(DestroyRef);
  const cartService = inject(CartService);
  const cartStore = inject(CartStore);
  const cart = signal<Cart | null>(null);
  const isLoading = signal(false);
  const error = signal<string | null>(null);
  let subscription: Subscription | undefined;

  const load = (): void => {
    const id = carrinhoId();
    if (id === null || isLoading()) return;

    subscription?.unsubscribe();
    isLoading.set(true);
    error.set(null);
    subscription = cartService.getById(id).subscribe({
      next: (value) => {
        cart.set(value);
        cartStore.setItems(value.items);
        isLoading.set(false);
      },
      error: () => {
        cart.set(null);
        isLoading.set(false);
        error.set('Não foi possível carregar o carrinho. Tente novamente.');
      },
    });
  };

  destroyRef.onDestroy(() => subscription?.unsubscribe());
  return { cart, isLoading, error, load, reload: load };
}
