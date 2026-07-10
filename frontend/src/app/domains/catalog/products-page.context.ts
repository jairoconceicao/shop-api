import { computed, inject, signal, type Signal } from '@angular/core';

import { CatalogService } from '@core/catalog/catalog.service';
import type { ProductCatalogItem } from '@shared/models';

import {
  createIncrementalSectionState,
  type IncrementalSectionPagination,
} from '../home/home-featured-products.context';

export interface ProductsCatalogState {
  readonly items: Signal<readonly ProductCatalogItem[]>;
  readonly isLoading: Signal<boolean>;
  readonly isInitialLoading: Signal<boolean>;
  readonly isLoadingMore: Signal<boolean>;
  readonly error: Signal<string | null>;
  readonly loadMoreError: Signal<string | null>;
  readonly isEmpty: Signal<boolean>;
  readonly hasMore: Signal<boolean>;
  readonly pagination: Signal<IncrementalSectionPagination>;
  readonly searchword: Signal<string>;
  reload(): void;
  loadMore(): void;
  setSearchword(value: string): void;
}

export function createProductsCatalogState(
  selectedCategoryId: Signal<number | null>,
  initialSearchword = '',
): ProductsCatalogState {
  const catalogService = inject(CatalogService);
  const searchword = signal(initialSearchword);
  const normalizedSearchword = computed(() => normalizeSearchword(searchword()));

  const incrementalState = createIncrementalSectionState(
    ({ page, size }) => {
      const categoryId = selectedCategoryId();

      return categoryId === null
        ? catalogService.listPublicProducts({
            page,
            size,
            searchword: normalizedSearchword(),
          })
        : catalogService.listPublicProductsByCategory(categoryId, {
            page,
            size,
          });
    },
    'Nao foi possivel carregar o catalogo de produtos. Tente novamente.',
    8,
  );

  return {
    ...incrementalState,
    searchword,
    setSearchword(value: string): void {
      searchword.set(value);
    },
  };
}

function normalizeSearchword(value: string): string | undefined {
  const normalized = value.trim();

  return normalized ? normalized : undefined;
}
