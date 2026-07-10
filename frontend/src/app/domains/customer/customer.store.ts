import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import type { CustomerDetails } from '@shared/models';

interface CustomerState {
  readonly profile: CustomerDetails | null;
  readonly isLoading: boolean;
  readonly error: string | null;
}

const initialState: CustomerState = {
  profile: null,
  isLoading: false,
  error: null,
};

export const CustomerStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ profile, isLoading, error }) => ({
    hasProfile: computed(() => profile() !== null),
    displayName: computed(() => profile()?.nome ?? ''),
    email: computed(() => profile()?.email ?? ''),
    customerId: computed(() => profile()?.clienteId ?? null),
    cpf: computed(() => profile()?.cpf ?? ''),
    primaryPhone: computed(() => {
      const cellphone = profile()?.celular;
      return cellphone ? `(${cellphone.ddd}) ${cellphone.numero}` : '';
    }),
    isReady: computed(() => profile() !== null && !isLoading()),
    isEmpty: computed(() => profile() === null && !isLoading()),
    isLoading: computed(() => isLoading()),
    error: computed(() => error()),
  })),
  withMethods((store) => ({
    setProfile(profile: CustomerDetails): void {
      patchState(store, {
        profile,
        isLoading: false,
        error: null,
      });
    },

    clearProfile(): void {
      patchState(store, initialState);
    },

    startLoading(): void {
      patchState(store, {
        isLoading: true,
        error: null,
      });
    },

    setError(error: string): void {
      patchState(store, {
        isLoading: false,
        error,
      });
    },
  })),
);
