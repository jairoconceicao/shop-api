import { computed, inject, signal, type Signal } from '@angular/core';
import type { Subscription } from 'rxjs';

import { OrderService } from '@core/order/order.service';
import type { CartItem, CreateOrderRequest, CustomerAddress, OrderCreated, PaymentMethod } from '@shared/models';

export interface CheckoutSubmitState {
  readonly isSubmitting: Signal<boolean>;
  readonly error: Signal<string | null>;
  readonly success: Signal<boolean>;
  readonly createdOrder: Signal<OrderCreated | null>;
  readonly canSubmit: Signal<boolean>;
  submit(request: {
    deliveryAddress: Signal<CustomerAddress>;
    paymentMethod: Signal<PaymentMethod>;
    items: Signal<readonly CartItem[]>;
  }): void;
}

export function createCheckoutSubmitState(): CheckoutSubmitState {
  const orderService = inject(OrderService);
  const isSubmitting = signal(false);
  const error = signal<string | null>(null);
  const success = signal(false);
  const createdOrder = signal<OrderCreated | null>(null);
  let subscription: Subscription | undefined;

  return {
    isSubmitting,
    error,
    success,
    createdOrder,
    canSubmit: computed(() => !isSubmitting() && !success()),
    submit(request) {
      const items = request.items();

      if (isSubmitting() || items.length === 0) {
        return;
      }

      isSubmitting.set(true);
      error.set(null);
      success.set(false);
      subscription?.unsubscribe();

      const payload: CreateOrderRequest = {
        enderecoEntrega: request.deliveryAddress(),
        formaPagamento: request.paymentMethod(),
        dataPedido: new Date().toISOString(),
        items: items.map((item) => ({
          itemId: item.itemId,
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario,
        })),
      };

      subscription = orderService.create(payload).subscribe({
        next: (order) => {
          createdOrder.set(order);
          success.set(true);
          isSubmitting.set(false);
        },
        error: () => {
          error.set('Não foi possível criar o pedido. Tente novamente.');
          isSubmitting.set(false);
        },
      });
    },
  };
}
