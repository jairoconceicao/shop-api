import { signal, type Signal } from '@angular/core';

import type { OrderListParams } from '@shared/models';

export interface OrdersPageFiltersContext {
  readonly dataInicio: Signal<string>;
  readonly dataFim: Signal<string>;
  setDataInicio(value: string): void;
  setDataFim(value: string): void;
  clearFilters(): void;
  buildOrderListParams(cpf: string): OrderListParams;
}

export function createOrdersPageFiltersContext(): OrdersPageFiltersContext {
  const dataInicio = signal('');
  const dataFim = signal('');

  return {
    dataInicio,
    dataFim,
    setDataInicio(value: string): void {
      dataInicio.set(value);
    },
    setDataFim(value: string): void {
      dataFim.set(value);
    },
    clearFilters(): void {
      dataInicio.set('');
      dataFim.set('');
    },
    buildOrderListParams(cpf: string): OrderListParams {
      return {
        cpf,
        page: 1,
        size: 20,
        dataInicio: normalizeDateFilter(dataInicio()),
        dataFim: normalizeDateFilter(dataFim()),
      };
    },
  };
}

function normalizeDateFilter(value: string): string | undefined {
  const normalized = value.trim();

  return normalized ? normalized : undefined;
}
