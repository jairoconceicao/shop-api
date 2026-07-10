import { computed, type Signal } from '@angular/core';

import type { ProductDetails } from '@shared/models';

export interface ProductDetailsAvailabilityState {
  readonly isUnavailable: Signal<boolean>;
  readonly stockLabel: Signal<string>;
}

export function createProductDetailsAvailabilityState(
  product: Signal<ProductDetails | null>,
): ProductDetailsAvailabilityState {
  const stock = computed(() => normalizeStock(product()?.estoque));
  const isUnavailable = computed(() => stock() <= 0);
  const stockLabel = computed(() =>
    isUnavailable() ? 'Sem estoque' : `${formatStock(stock())} em estoque`,
  );

  return {
    isUnavailable,
    stockLabel,
  };
}

function normalizeStock(value: number | string | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  const numericValue = typeof value === 'string' ? Number(value) : value;

  return Number.isFinite(numericValue) ? numericValue : 0;
}

function formatStock(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 0,
  }).format(value);
}
