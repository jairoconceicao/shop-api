import { effect, signal, type Signal } from '@angular/core';

import type { CustomerAddress } from '@shared/models';

export interface CheckoutAddressState {
  readonly deliveryAddress: Signal<CustomerAddress>;
  setDeliveryAddressField(field: keyof CustomerAddress, value: string): void;
}

export function createCheckoutAddressState(baseAddress: Signal<CustomerAddress | null>): CheckoutAddressState {
  const deliveryAddress = signal<CustomerAddress>(createAddressDraft(baseAddress()));
  const isDirty = signal(false);

  effect(() => {
    const address = baseAddress();

    if (!isDirty()) {
      deliveryAddress.set(createAddressDraft(address));
    }
  });

  return {
    deliveryAddress,
    setDeliveryAddressField(field: keyof CustomerAddress, value: string): void {
      isDirty.set(true);
      deliveryAddress.update((current) => ({
        ...current,
        [field]: field === 'complemento' ? value : value.trim(),
      }));
    },
  };
}

function createAddressDraft(baseAddress: CustomerAddress | null): CustomerAddress {
  return {
    logradouro: baseAddress?.logradouro ?? '',
    numero: baseAddress?.numero ?? '',
    complemento: baseAddress?.complemento ?? '',
    cep: baseAddress?.cep ?? '',
    bairro: baseAddress?.bairro ?? '',
    cidade: baseAddress?.cidade ?? '',
    uf: baseAddress?.uf ?? '',
  };
}
