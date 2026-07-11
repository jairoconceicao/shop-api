import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { finalize, Subscription } from 'rxjs';

import { AuthService } from '@core/auth/auth.service';
import { TokenStorageService } from '@core/auth/token-storage.service';
import type { AuthLoginRequest, AuthSession } from '@shared/models';

interface AuthState {
  readonly session: AuthSession | null;
  readonly isLoading: boolean;
  readonly error: string | null;
}

const initialState: AuthState = {
  session: null,
  isLoading: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ session, isLoading, error }) => ({
    isAuthenticated: computed(() => session() !== null),
    session: computed(() => session()),
    token: computed(() => session()?.token ?? ''),
    email: computed(() => session()?.email ?? ''),
    customerId: computed(() => session()?.clienteId ?? null),
    userId: computed(() => session()?.usuarioId ?? null),
    isLoading: computed(() => isLoading()),
    error: computed(() => error()),
  })),
  withMethods((store) => {
    const authService = inject(AuthService);
    const tokenStorage = inject(TokenStorageService);
    let authSubscription: Subscription | null = null;

    return {
      loadSession(): void {
        const session = tokenStorage.getSession();

        patchState(store, {
          session,
          isLoading: false,
          error: null,
        });
      },

      setSession(session: AuthSession): void {
        patchState(store, {
          session,
          isLoading: false,
          error: null,
        });
      },

      clearSession(): void {
        authSubscription?.unsubscribe();
        authSubscription = null;
        patchState(store, initialState);
      },

      login(credentials: AuthLoginRequest): void {
        authSubscription?.unsubscribe();
        patchState(store, {
          isLoading: true,
          error: null,
        });

        authSubscription = authService
          .login(credentials)
          .pipe(finalize(() => { authSubscription = null; }))
          .subscribe({
            next: (session) => {
              patchState(store, {
                session,
                isLoading: false,
                error: null,
              });
            },
            error: () => {
              patchState(store, {
                session: null,
                isLoading: false,
                error: 'Nao foi possivel autenticar o usuario.',
              });
            },
          });
      },

      logout(): void {
        authSubscription?.unsubscribe();
        patchState(store, {
          isLoading: true,
          error: null,
        });

        authSubscription = authService
          .logout()
          .pipe(finalize(() => { authSubscription = null; }))
          .subscribe({
            next: () => {
              patchState(store, initialState);
            },
            error: () => {
              patchState(store, {
                session: null,
                isLoading: false,
                error: 'Nao foi possivel encerrar a sessao.',
              });
            },
          });
      },
    };
  }),
);
