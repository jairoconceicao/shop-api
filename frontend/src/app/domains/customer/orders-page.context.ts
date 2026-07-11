import { computed, effect, inject } from '@angular/core';

import { OrdersStore } from '../checkout/orders.store';
import type { Order } from '@shared/models';
import { CustomerStore } from './customer.store';
import { createOrdersPageFiltersContext } from './orders-page-filters.context';

export interface OrdersPageContext {
  readonly customerCpf: () => string;
  readonly hasCustomerProfile: () => boolean;
  readonly dataInicio: () => string;
  readonly dataFim: () => string;
  readonly orders: () => readonly Order[];
  readonly totalItems: () => number;
  readonly totalPages: () => number;
  readonly currentPage: () => number;
  readonly pageSize: () => number;
  readonly isLoadingOrders: () => boolean;
  readonly hasOrders: () => boolean;
  readonly ordersError: () => string | null;
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly accountLinkLabel: string;
  setDataInicio(value: string): void;
  setDataFim(value: string): void;
  clearFilters(): void;
  ensureCustomerProfileLoaded(): void;
}

export function createOrdersPageContext(): OrdersPageContext {
  const customerStore = inject(CustomerStore);
  const ordersStore = inject(OrdersStore);
  const filtersContext = createOrdersPageFiltersContext();
  let lastLoadedCpf = '';

  effect(() => {
    const cpf = customerStore.cpf();

    if (!customerStore.hasProfile() || !cpf || cpf === lastLoadedCpf) {
      return;
    }

    lastLoadedCpf = cpf;
    ordersStore.loadOrders(filtersContext.buildOrderListParams(cpf));
  });

  return {
    customerCpf: computed(() => customerStore.cpf()),
    hasCustomerProfile: computed(() => customerStore.hasProfile()),
    dataInicio: filtersContext.dataInicio,
    dataFim: filtersContext.dataFim,
    orders: ordersStore.orders,
    totalItems: ordersStore.totalItems,
    totalPages: ordersStore.totalPages,
    currentPage: ordersStore.currentPage,
    pageSize: ordersStore.pageSize,
    isLoadingOrders: ordersStore.isLoading,
    hasOrders: ordersStore.hasOrders,
    ordersError: ordersStore.error,
    eyebrow: 'Meus Pedidos',
    title: 'Acompanhe seus pedidos',
    description: 'Veja o status e os detalhes de todas as suas compras.',
    accountLinkLabel: 'Voltar para conta',
    setDataInicio(value: string): void {
      filtersContext.setDataInicio(value);
      lastLoadedCpf = '';
      const cpf = customerStore.cpf();

      if (customerStore.hasProfile() && cpf) {
        ordersStore.loadOrders(filtersContext.buildOrderListParams(cpf));
        lastLoadedCpf = cpf;
      }
    },
    setDataFim(value: string): void {
      filtersContext.setDataFim(value);
      lastLoadedCpf = '';
      const cpf = customerStore.cpf();

      if (customerStore.hasProfile() && cpf) {
        ordersStore.loadOrders(filtersContext.buildOrderListParams(cpf));
        lastLoadedCpf = cpf;
      }
    },
    clearFilters(): void {
      filtersContext.clearFilters();
      lastLoadedCpf = '';
      const cpf = customerStore.cpf();

      if (customerStore.hasProfile() && cpf) {
        ordersStore.loadOrders(filtersContext.buildOrderListParams(cpf));
        lastLoadedCpf = cpf;
      }
    },
    ensureCustomerProfileLoaded(): void {
      if (!customerStore.hasProfile() && !customerStore.isLoading()) {
        customerStore.loadProfile();
        return;
      }

      const cpf = customerStore.cpf();

      if (customerStore.hasProfile() && cpf && cpf !== lastLoadedCpf) {
        lastLoadedCpf = cpf;
        ordersStore.loadOrders(filtersContext.buildOrderListParams(cpf));
      }
    },
  };
}
