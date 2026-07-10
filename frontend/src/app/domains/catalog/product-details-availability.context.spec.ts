import { signal } from '@angular/core';
import { describe, expect, it } from 'vitest';

import { createProductDetailsAvailabilityState } from './product-details-availability.context';

describe('createProductDetailsAvailabilityState', () => {
  it('marks zero stock as unavailable', () => {
    const product = signal({
      produtoId: 101,
      titulo: 'Notebook Gamer',
      descricao: null,
      modelo: null,
      foto: null,
      preco: 5999.9,
      estoque: 0,
      categoria: null,
    });

    const state = createProductDetailsAvailabilityState(product);

    expect(state.isUnavailable()).toBe(true);
    expect(state.stockLabel()).toBe('Sem estoque');
  });

  it('formats the stock label for available products', () => {
    const product = signal({
      produtoId: 101,
      titulo: 'Notebook Gamer',
      descricao: null,
      modelo: null,
      foto: null,
      preco: 5999.9,
      estoque: '12',
      categoria: null,
    });

    const state = createProductDetailsAvailabilityState(product);

    expect(state.isUnavailable()).toBe(false);
    expect(state.stockLabel()).toBe('12 em estoque');
  });
});
