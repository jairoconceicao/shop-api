import { computed, type Signal } from '@angular/core';

import type { IncrementalSectionPagination } from '../home/home-featured-products.context';

export interface CatalogPaginationMetric {
  readonly label: string;
  readonly value: Signal<string>;
  readonly ariaLabel: Signal<string>;
}

export interface ProductsPagePaginationState {
  readonly metrics: readonly CatalogPaginationMetric[];
}

export function createProductsPagePaginationState(
  pagination: Signal<IncrementalSectionPagination>,
  isLoading: Signal<boolean>,
): ProductsPagePaginationState {
  const metricValue = (label: string, extract: (value: IncrementalSectionPagination) => number): CatalogPaginationMetric => ({
    label,
    value: computed(() => (isLoading() ? '...' : `${extract(pagination())}`)),
    ariaLabel: computed(() => (isLoading() ? `${label} carregando` : `${label} ${extract(pagination())}`)),
  });

  return {
    metrics: [
      metricValue('Página', (value) => value.page),
      metricValue('Tamanho', (value) => value.size),
      metricValue('Total de itens', (value) => value.totalItems),
    ] as const,
  };
}
