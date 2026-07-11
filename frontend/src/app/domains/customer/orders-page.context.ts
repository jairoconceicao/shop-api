import { computed, inject } from '@angular/core';

import { CustomerStore } from './customer.store';

export interface OrdersPageContext {
  readonly customerCpf: () => string;
  readonly hasCustomerProfile: () => boolean;
  ensureCustomerProfileLoaded(): void;
}

export function createOrdersPageContext(): OrdersPageContext {
  const customerStore = inject(CustomerStore);

  return {
    customerCpf: computed(() => customerStore.cpf()),
    hasCustomerProfile: computed(() => customerStore.hasProfile()),
    ensureCustomerProfileLoaded(): void {
      if (!customerStore.hasProfile() && !customerStore.isLoading()) {
        customerStore.loadProfile();
      }
    },
  };
}
