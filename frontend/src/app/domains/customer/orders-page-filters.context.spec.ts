import { TestBed } from '@angular/core/testing';

import { createOrdersPageFiltersContext } from './orders-page-filters.context';

describe('createOrdersPageFiltersContext', () => {
  it('normalizes empty filters as undefined when building order params', () => {
    TestBed.runInInjectionContext(() => {
      const context = createOrdersPageFiltersContext();

      expect(context.buildOrderListParams('12345678901')).toEqual({
        cpf: '12345678901',
        page: 1,
        size: 20,
        dataInicio: undefined,
        dataFim: undefined,
      });
    });
  });

  it('preserves filled filters and clears them on demand', () => {
    TestBed.runInInjectionContext(() => {
      const context = createOrdersPageFiltersContext();

      context.setDataInicio('2026-07-01');
      context.setDataFim('2026-07-10');

      expect(context.dataInicio()).toBe('2026-07-01');
      expect(context.dataFim()).toBe('2026-07-10');
      expect(context.buildOrderListParams('12345678901')).toEqual({
        cpf: '12345678901',
        page: 1,
        size: 20,
        dataInicio: '2026-07-01',
        dataFim: '2026-07-10',
      });

      context.clearFilters();

      expect(context.dataInicio()).toBe('');
      expect(context.dataFim()).toBe('');
    });
  });
});
