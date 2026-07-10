import { computed, inject, type Signal } from '@angular/core';
import { Router } from '@angular/router';

import { TokenStorageService } from '@core/auth/token-storage.service';

export interface ProductDetailsPurchaseState {
  readonly canStartPurchase: Signal<boolean>;
  startPurchase(): void;
}

export function createProductDetailsPurchaseState(
  productId: Signal<number | null>,
): ProductDetailsPurchaseState {
  const router = inject(Router);
  const tokenStorage = inject(TokenStorageService);

  const canStartPurchase = computed(() => productId() !== null);

  const startPurchase = (): void => {
    const currentProductId = productId();

    if (currentProductId === null) {
      return;
    }

    if (!tokenStorage.hasToken()) {
      void router.navigate(['/login'], {
        queryParams: {
          returnUrl: `/products/${currentProductId}`,
        },
      });
      return;
    }

    void router.navigate(['/cart']);
  };

  return {
    canStartPurchase,
    startPurchase,
  };
}
