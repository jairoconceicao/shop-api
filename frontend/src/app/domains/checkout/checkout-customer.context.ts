import { computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';

import { TokenStorageService } from '@core/auth/token-storage.service';
import { CustomerService } from '@core/customer/customer.service';
import type { CustomerAddress, CustomerDetails } from '@shared/models';

export interface CheckoutCustomerState {
  readonly profile: Signal<CustomerDetails | null>;
  readonly baseAddress: Signal<CustomerAddress | null>;
}

export function createCheckoutCustomerState(): CheckoutCustomerState {
  const tokenStorage = inject(TokenStorageService);
  const customerService = inject(CustomerService);
  const session = tokenStorage.getSession();
  const clienteId = Number(session?.clienteId);
  const profile = toSignal<CustomerDetails | null>(
    Number.isFinite(clienteId) ? customerService.getById(clienteId) : of(null),
    { initialValue: null },
  );

  return {
    profile,
    baseAddress: computed(() => profile()?.endereco ?? null),
  };
}
