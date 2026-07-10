import { DestroyRef, computed, effect, inject, signal, type Signal } from '@angular/core';
import type { Subscription } from 'rxjs';

import { CatalogService } from '@core/catalog/catalog.service';
import type { ProductDetails } from '@shared/models';

export interface ProductDetailsState {
  readonly product: Signal<ProductDetails | null>;
  readonly isLoading: Signal<boolean>;
  readonly error: Signal<string | null>;
  readonly isEmpty: Signal<boolean>;
  reload(): void;
}

export function createProductDetailsState(productId: Signal<number | null>): ProductDetailsState {
  const destroyRef = inject(DestroyRef);
  const catalogService = inject(CatalogService);
  const product = signal<ProductDetails | null>(null);
  const isLoading = signal(true);
  const error = signal<string | null>(null);

  let subscription: Subscription | null = null;

  const loadProduct = (id: number): void => {
    subscription?.unsubscribe();
    isLoading.set(true);
    error.set(null);

    subscription = catalogService.getPublicProductById(id).subscribe({
      next: (value) => {
        product.set(value);
        isLoading.set(false);
      },
      error: () => {
        product.set(null);
        error.set('Nao foi possivel carregar o produto. Tente novamente.');
        isLoading.set(false);
      },
    });
  };

  const reload = (): void => {
    const currentProductId = productId();

    if (currentProductId === null) {
      return;
    }

    loadProduct(currentProductId);
  };

  effect(() => {
    const currentProductId = productId();

    if (currentProductId === null) {
      subscription?.unsubscribe();
      product.set(null);
      isLoading.set(false);
      error.set('Produto indisponivel.');
      return;
    }

    loadProduct(currentProductId);
  });

  destroyRef.onDestroy(() => subscription?.unsubscribe());

  return {
    product,
    isLoading,
    error,
    isEmpty: computed(() => !isLoading() && !error() && product() === null),
    reload,
  };
}
