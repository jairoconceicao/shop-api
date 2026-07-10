import { computed, inject, signal, type Signal } from '@angular/core';

import { CustomerStore } from './customer.store';

export interface AccountCancelConfirmationState {
  readonly isAwaitingConfirmation: Signal<boolean>;
  readonly confirmationTitle: Signal<string>;
  readonly confirmationDescription: Signal<string>;
  readonly actionLabel: Signal<string>;
  readonly cancelLabel: Signal<string>;
  begin(): void;
  cancel(): void;
  confirm(): void;
}

export function createAccountCancelConfirmationState(): AccountCancelConfirmationState {
  const customerStore = inject(CustomerStore);
  const isAwaitingConfirmation = signal(false);

  return {
    isAwaitingConfirmation,
    confirmationTitle: computed(() => 'Confirmar cancelamento da conta'),
    confirmationDescription: computed(
      () =>
        'Esta ação vai remover permanentemente a conta do cliente. Confirme somente se desejar cancelar o cadastro e perder acesso aos dados vinculados.',
    ),
    actionLabel: computed(() => (isAwaitingConfirmation() ? 'Sim, cancelar conta' : 'Cancelar conta')),
    cancelLabel: computed(() => 'Manter minha conta'),
    begin(): void {
      isAwaitingConfirmation.set(true);
    },
    cancel(): void {
      isAwaitingConfirmation.set(false);
    },
    confirm(): void {
      if (!isAwaitingConfirmation() || customerStore.isLoading()) {
        return;
      }

      customerStore.deleteProfile();
      isAwaitingConfirmation.set(false);
    },
  };
}
