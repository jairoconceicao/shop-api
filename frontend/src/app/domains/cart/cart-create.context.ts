import { DestroyRef, inject, signal } from '@angular/core';
import type { Subscription } from 'rxjs';

import { CartService } from '@core/cart/cart.service';

export function createCartCreationContext() {
  const cartService = inject(CartService);
  const destroyRef = inject(DestroyRef);
  const isLoading = signal(false);
  const error = signal<string | null>(null);
  const createdCartId = signal<number | string | null>(null);
  let subscription: Subscription | undefined;

  const create = (): void => {
    if (isLoading() || createdCartId() !== null) return;
    isLoading.set(true);
    error.set(null);
    subscription = cartService.create().subscribe({
      next: ({ carrinhoId }) => {
        createdCartId.set(carrinhoId);
        isLoading.set(false);
      },
      error: () => {
        error.set('Não foi possível criar o carrinho. Tente novamente.');
        isLoading.set(false);
      },
    });
  };

  destroyRef.onDestroy(() => subscription?.unsubscribe());
  return { isLoading, error, createdCartId, create };
}
