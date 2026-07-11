import { computed, effect, inject } from '@angular/core';

import { OrdersStore } from '../checkout/orders.store';
import type { Order } from '@shared/models';
import { CustomerStore } from './customer.store';

export interface OrdersPageContext {
  readonly customerCpf: () => string;
  readonly hasCustomerProfile: () => boolean;
  readonly orders: () => readonly Order[];
  readonly totalItems: () => number;
  readonly totalPages: () => number;
  readonly currentPage: () => number;
  readonly pageSize: () => number;
  readonly isLoadingOrders: () => boolean;
  readonly hasOrders: () => boolean;
  readonly ordersError: () => string | null;
  ensureCustomerProfileLoaded(): void;
}

export function createOrdersPageContext(): OrdersPageContext {
  const customerStore = inject(CustomerStore);
  const ordersStore = inject(OrdersStore);
  let lastLoadedCpf = '';

  effect(() => {
    const cpf = customerStore.cpf();

    if (!customerStore.hasProfile() || !cpf || cpf === lastLoadedCpf) {
      return;
    }

    lastLoadedCpf = cpf;
    ordersStore.loadOrders({ cpf, page: 1, size: 20 });
  });

  return {
    customerCpf: computed(() => customerStore.cpf()),
    hasCustomerProfile: computed(() => customerStore.hasProfile()),
    orders: ordersStore.orders,
    totalItems: ordersStore.totalItems,
    totalPages: ordersStore.totalPages,
    currentPage: ordersStore.currentPage,
    pageSize: ordersStore.pageSize,
    isLoadingOrders: ordersStore.isLoading,
    hasOrders: ordersStore.hasOrders,
    ordersError: ordersStore.error,
    ensureCustomerProfileLoaded(): void {
      if (!customerStore.hasProfile() && !customerStore.isLoading()) {
        customerStore.loadProfile();
      }
    },
  };
}
