import { DestroyRef, computed, inject, signal, type Signal } from '@angular/core';
import type { Observable, Subscription } from 'rxjs';

import { normalizePaginationData, type ApiPagination, type PagedResponse } from '@shared/api';

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
  readonly pagination: Signal<IncrementalSectionPagination>;
  reload(): void;
  loadMore(): void;
}

export interface IncrementalSectionPagination {
  readonly page: number;
  readonly size: number;
  readonly totalItems: number;
  readonly totalPages: number;
}

export function createIncrementalSectionState<T>(
  loader: (query: IncrementalSectionQuery) => Observable<ApiPagination<T> | PagedResponse<T>>,
  errorMessage: string,
  pageSize = 4,
): IncrementalSectionState<T> {
  const destroyRef = inject(DestroyRef);
  const items = signal<readonly T[]>([]);
  const isInitialLoading = signal(true);
  const isLoadingMore = signal(false);
  const error = signal<string | null>(null);
  const loadMoreError = signal<string | null>(null);
  const pagination = signal<IncrementalSectionPagination>({
    page: 0,
    size: pageSize,
    totalItems: 0,
    totalPages: 0,
  });

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
      pagination.set({
        page: 0,
        size: pageSize,
        totalItems: 0,
        totalPages: 0,
      });
    }

    subscription = loader({ page, size: pageSize }).subscribe({
      next: (response) => {
        const pageInfo = normalizeIncrementalPagination(response);
        const nextItems = pageInfo.data;

        items.set(loadingMore ? [...items(), ...nextItems] : nextItems);
        pagination.set({
          page,
          size: pageInfo.size,
          totalItems: pageInfo.totalItems,
          totalPages: pageInfo.pages,
        });
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

    loadPage(pagination().page + 1, true);
  };

  const hasMore = computed(
    () => !isInitialLoading() && !error() && pagination().page > 0 && pagination().page < pagination().totalPages,
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
    pagination,
    reload,
    loadMore,
  };
}

function normalizeIncrementalPagination<T>(
  response: ApiPagination<T> | PagedResponse<T>,
): ApiPagination<T> {
  return 'pagination' in response ? normalizePaginationData(response) : response;
}
