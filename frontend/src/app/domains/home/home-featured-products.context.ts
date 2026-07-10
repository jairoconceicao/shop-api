import { DestroyRef, computed, inject, signal, type Signal } from '@angular/core';
import type { Observable, Subscription } from 'rxjs';

import type { PagedResponse } from '@shared/api';

interface IncrementalSectionQuery {
  page: number;
  size: number;
}

export interface IncrementalSectionState<T> {
  readonly items: Signal<readonly T[]>;
  readonly isLoading: Signal<boolean>;
  readonly isInitialLoading: Signal<boolean>;
  readonly isLoadingMore: Signal<boolean>;
  readonly error: Signal<string | null>;
  readonly loadMoreError: Signal<string | null>;
  readonly isEmpty: Signal<boolean>;
  readonly hasMore: Signal<boolean>;
  reload(): void;
  loadMore(): void;
}

export function createIncrementalSectionState<T>(
  loader: (query: IncrementalSectionQuery) => Observable<PagedResponse<T>>,
  errorMessage: string,
  pageSize = 4,
): IncrementalSectionState<T> {
  const destroyRef = inject(DestroyRef);
  const items = signal<readonly T[]>([]);
  const isInitialLoading = signal(true);
  const isLoadingMore = signal(false);
  const error = signal<string | null>(null);
  const loadMoreError = signal<string | null>(null);
  const currentPage = signal(0);
  const totalPages = signal(0);

  let subscription: Subscription | null = null;

  const finalize = (loadingMore: boolean): void => {
    if (loadingMore) {
      isLoadingMore.set(false);
      return;
    }

    isInitialLoading.set(false);
  };

  const loadPage = (page: number, loadingMore: boolean): void => {
    subscription?.unsubscribe();

    if (loadingMore) {
      isLoadingMore.set(true);
      loadMoreError.set(null);
    } else {
      isInitialLoading.set(true);
      error.set(null);
      loadMoreError.set(null);
      items.set([]);
      currentPage.set(0);
      totalPages.set(0);
    }

    subscription = loader({ page, size: pageSize }).subscribe({
      next: (response) => {
        const nextItems = response.pagination.data;

        items.set(loadingMore ? [...items(), ...nextItems] : nextItems);
        currentPage.set(page);
        totalPages.set(response.pagination.pages);
        finalize(loadingMore);
      },
      error: () => {
        if (loadingMore) {
          loadMoreError.set(errorMessage);
        } else {
          error.set(errorMessage);
        }

        finalize(loadingMore);
      },
    });
  };

  const reload = (): void => loadPage(1, false);

  const loadMore = (): void => {
    if (isInitialLoading() || isLoadingMore() || error() || !hasMore()) {
      return;
    }

    loadPage(currentPage() + 1, true);
  };

  const hasMore = computed(
    () => !isInitialLoading() && !error() && currentPage() > 0 && currentPage() < totalPages(),
  );

  destroyRef.onDestroy(() => subscription?.unsubscribe());
  reload();

  return {
    items,
    isLoading: isInitialLoading,
    isInitialLoading,
    isLoadingMore,
    error,
    loadMoreError,
    isEmpty: computed(() => !isInitialLoading() && !error() && items().length === 0),
    hasMore,
    reload,
    loadMore,
  };
}
