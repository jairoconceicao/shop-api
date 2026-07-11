import { computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { OrdersStore } from '../checkout/orders.store';
import type { Order } from '@shared/models';

export interface OrderDetailPageContext {
  readonly pedidoId: () => string;
  readonly order: () => Order | null;
  readonly isLoadingOrder: () => boolean;
  readonly hasOrder: () => boolean;
  readonly orderError: () => string | null;
  loadOrderDetail(): void;
  clearOrderDetail(): void;
}

export function createOrderDetailPageContext(): OrderDetailPageContext {
  const route = inject(ActivatedRoute);
  const ordersStore = inject(OrdersStore);

  const pedidoId = computed(() => route.snapshot.paramMap.get('pedidoId') ?? '');

  return {
    pedidoId,
    order: ordersStore.currentOrder,
    isLoadingOrder: ordersStore.isLoadingDetail,
    hasOrder: computed(() => ordersStore.currentOrder() !== null),
    orderError: ordersStore.error,
    loadOrderDetail(): void {
      const value = pedidoId();

      if (!value) {
        return;
      }

      ordersStore.loadOrderDetail(value);
    },
    clearOrderDetail(): void {
      ordersStore.clearCurrentOrder();
    },
  };
}
