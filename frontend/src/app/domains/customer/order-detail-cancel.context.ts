import { computed, inject, signal, type Signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { OrdersStore } from '../checkout/orders.store';

export interface OrderDetailCancelContext {
  readonly pedidoId: Signal<string>;
  readonly isAwaitingConfirmation: Signal<boolean>;
  readonly isCancellingOrder: Signal<boolean>;
  readonly canCancelOrder: Signal<boolean>;
  readonly confirmationTitle: Signal<string>;
  readonly confirmationDescription: Signal<string>;
  readonly actionLabel: Signal<string>;
  readonly cancelLabel: Signal<string>;
  begin(): void;
  cancel(): void;
  confirm(): void;
}

export function createOrderDetailCancelContext(): OrderDetailCancelContext {
  const route = inject(ActivatedRoute);
  const ordersStore = inject(OrdersStore);
  const isAwaitingConfirmation = signal(false);
  const pedidoId = computed(() => route.snapshot.paramMap.get('pedidoId') ?? '');
  const canCancelOrder = computed(() => {
    const order = ordersStore.currentOrder();

    return order !== null && order.pedidoId.toString() === pedidoId() && order.status !== 'Cancelado';
  });

  return {
    pedidoId,
    isAwaitingConfirmation,
    isCancellingOrder: ordersStore.isCancelling,
    canCancelOrder,
    confirmationTitle: computed(() => 'Confirmar cancelamento do pedido'),
    confirmationDescription: computed(
      () =>
        'Esta ação vai cancelar o pedido selecionado e enviar para a API apenas o status "Cancelado".',
    ),
    actionLabel: computed(() => (isAwaitingConfirmation() ? 'Sim, cancelar pedido' : 'Cancelar pedido')),
    cancelLabel: computed(() => 'Manter pedido'),
    begin(): void {
      if (!canCancelOrder() || ordersStore.isCancelling()) {
        return;
      }

      isAwaitingConfirmation.set(true);
    },
    cancel(): void {
      isAwaitingConfirmation.set(false);
    },
    confirm(): void {
      if (!isAwaitingConfirmation() || !canCancelOrder() || ordersStore.isCancelling()) {
        return;
      }

      ordersStore.cancelOrder(pedidoId());
      isAwaitingConfirmation.set(false);
    },
  };
}
