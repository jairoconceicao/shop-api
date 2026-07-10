import { signal } from '@angular/core';
import { describe, expect, it } from 'vitest';

import { createProductsPagePaginationState } from './products-page-pagination.context';

describe('createProductsPagePaginationState', () => {
  it('reflects the pagination returned by the backend', () => {
    const pagination = signal({
      page: 3,
      size: 12,
      totalItems: 48,
      totalPages: 4,
    });
    const isLoading = signal(false);

    const state = createProductsPagePaginationState(pagination, isLoading);

    expect(state.metrics[0].label).toBe('Página');
    expect(state.metrics[0].value()).toBe('3');
    expect(state.metrics[0].ariaLabel()).toBe('Página 3');
    expect(state.metrics[1].value()).toBe('12');
    expect(state.metrics[2].value()).toBe('48');
  });

  it('shows loading placeholders while the catalog is loading', () => {
    const pagination = signal({
      page: 1,
      size: 8,
      totalItems: 24,
      totalPages: 3,
    });
    const isLoading = signal(true);

    const state = createProductsPagePaginationState(pagination, isLoading);

    expect(state.metrics[0].value()).toBe('...');
    expect(state.metrics[1].value()).toBe('...');
    expect(state.metrics[2].value()).toBe('...');
  });
});
