import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { finalize, Subscription } from 'rxjs';

import { CustomerService } from '@core/customer/customer.service';
import { TokenStorageService } from '@core/auth/token-storage.service';
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
  withMethods((store) => {
    const customerService = inject(CustomerService);
    const tokenStorage = inject(TokenStorageService);
    let profileSubscription: Subscription | null = null;

    const loadProfileByCustomerId = (customerId: number): void => {
      profileSubscription?.unsubscribe();
      patchState(store, {
        isLoading: true,
        error: null,
      });

      profileSubscription = customerService
        .getById(customerId)
        .pipe(finalize(() => {
          profileSubscription = null;
        }))
        .subscribe({
          next: (profile) => {
            patchState(store, {
              profile,
              isLoading: false,
              error: null,
            });
          },
          error: () => {
            patchState(store, {
              profile: null,
              isLoading: false,
              error: 'Nao foi possivel carregar os dados do cliente.',
            });
          },
        });
    };

    return {
      setProfile(profile: CustomerDetails): void {
        patchState(store, {
          profile,
          isLoading: false,
          error: null,
        });
      },

      clearProfile(): void {
        profileSubscription?.unsubscribe();
        profileSubscription = null;
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

      loadProfile(): void {
        const session = tokenStorage.getSession();
        const customerId = Number(session?.clienteId);

        if (!Number.isFinite(customerId)) {
          patchState(store, {
            profile: null,
            isLoading: false,
            error: 'Sessao do cliente indisponivel.',
          });
          return;
        }

        loadProfileByCustomerId(customerId);
      },
    };
  }),
);
