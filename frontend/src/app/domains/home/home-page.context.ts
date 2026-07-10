import { DestroyRef, computed, inject, signal, type Signal } from '@angular/core';
import type { Observable, Subscription } from 'rxjs';

export interface RemoteSectionState<T> {
  readonly items: Signal<readonly T[]>;
  readonly isLoading: Signal<boolean>;
  readonly error: Signal<string | null>;
  readonly isEmpty: Signal<boolean>;
  reload(): void;
}

export function createRemoteSectionState<T>(
  loader: () => Observable<readonly T[]>,
  errorMessage: string,
): RemoteSectionState<T> {
  const destroyRef = inject(DestroyRef);
  const items = signal<readonly T[]>([]);
  const isLoading = signal(true);
  const error = signal<string | null>(null);

  let subscription: Subscription | null = null;

  const reload = (): void => {
    subscription?.unsubscribe();
    isLoading.set(true);
    error.set(null);

    subscription = loader().subscribe({
      next: (value) => {
        items.set(value);
        isLoading.set(false);
      },
      error: () => {
        items.set([]);
        error.set(errorMessage);
        isLoading.set(false);
      },
    });
  };

  destroyRef.onDestroy(() => subscription?.unsubscribe());
  reload();

  return {
    items,
    isLoading,
    error,
    isEmpty: computed(() => !isLoading() && !error() && items().length === 0),
    reload,
  };
}
