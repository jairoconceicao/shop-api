import { signal, type Signal } from '@angular/core';

import type { PaymentMethod } from '@shared/models';

export interface CheckoutPaymentState {
  readonly paymentMethod: Signal<PaymentMethod>;
  readonly paymentOptions: readonly PaymentMethod[];
  setPaymentMethod(paymentMethod: PaymentMethod): void;
}

export function createCheckoutPaymentState(initialPaymentMethod: PaymentMethod = 'Pix'): CheckoutPaymentState {
  const paymentMethod = signal<PaymentMethod>(initialPaymentMethod);
  const paymentOptions = ['Pix', 'Cartao', 'Boleto'] as const;

  return {
    paymentMethod,
    paymentOptions,
    setPaymentMethod(paymentMethodValue: PaymentMethod): void {
      paymentMethod.set(paymentMethodValue);
    },
  };
}
