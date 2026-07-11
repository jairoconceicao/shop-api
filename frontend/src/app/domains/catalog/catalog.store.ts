import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { finalize, Subscription } from 'rxjs';

import { type ApiPagination } from '@shared/api';
import { CatalogService, type PublicProductCatalogQuery } from '@core/catalog/catalog.service';
import type { ProductCatalogItem, ProductDetails } from '@shared/models';

interface CatalogState {
  readonly products: readonly ProductCatalogItem[];
  readonly currentProduct: ProductDetails | null;
  readonly currentPage: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly totalPages: number;
  readonly searchword: string;
  readonly categoryId: number | null;
  readonly isLoading: boolean;
  readonly isLoadingDetail: boolean;
  readonly error: string | null;
}

const initialState: CatalogState = {
  products: [],
  currentProduct: null,
  currentPage: 1,
  pageSize: 12,
  totalItems: 0,
  totalPages: 0,
  searchword: '',
  categoryId: null,
  isLoading: false,
  isLoadingDetail: false,
  error: null,
};

export const CatalogStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(
    ({
      products,
      currentProduct,
      currentPage,
      pageSize,
      totalItems,
      totalPages,
      searchword,
      categoryId,
      isLoading,
      isLoadingDetail,
      error,
    }) => ({
      hasProducts: computed(() => products().length > 0),
      isEmpty: computed(() => products().length === 0 && !isLoading()),
      products: computed(() => products()),
      currentProduct: computed(() => currentProduct()),
      currentPage: computed(() => currentPage()),
      pageSize: computed(() => pageSize()),
      totalItems: computed(() => totalItems()),
      totalPages: computed(() => totalPages()),
      searchword: computed(() => searchword()),
      categoryId: computed(() => categoryId()),
      isLoading: computed(() => isLoading()),
      isLoadingDetail: computed(() => isLoadingDetail()),
      error: computed(() => error()),
    }),
  ),
  withMethods((store) => {
    const catalogService = inject(CatalogService);
    let listSubscription: Subscription | null = null;
    let detailSubscription: Subscription | null = null;

    const applyListResponse = (payload: ApiPagination<ProductCatalogItem>): void => {
      patchState(store, {
        products: [...payload.data],
        totalItems: payload.totalItems,
        totalPages: payload.pages,
        pageSize: payload.size,
        isLoading: false,
        error: null,
      });
    };

    const buildQuery = (query: PublicProductCatalogQuery): PublicProductCatalogQuery => ({
      page: query.page ?? store.currentPage(),
      size: query.size ?? store.pageSize(),
      searchword: query.searchword?.trim() || undefined,
    });

    const loadProductsInternal = (query: PublicProductCatalogQuery = {}): void => {
      listSubscription?.unsubscribe();
      const normalizedQuery = buildQuery(query);

      patchState(store, {
        isLoading: true,
        error: null,
        currentPage: normalizedQuery.page ?? 1,
        pageSize: normalizedQuery.size ?? store.pageSize(),
        searchword: normalizedQuery.searchword ?? '',
      });

      const request$ = store.categoryId()
        ? catalogService.listPublicProductsByCategory(store.categoryId()!, {
            page: normalizedQuery.page,
            size: normalizedQuery.size,
          })
        : catalogService.listPublicProducts(normalizedQuery);

      listSubscription = request$
        .pipe(finalize(() => { listSubscription = null; }))
        .subscribe({
          next: (pagination) => applyListResponse(pagination),
          error: () => {
            patchState(store, {
              products: [],
              totalItems: 0,
              totalPages: 0,
              isLoading: false,
              error: 'Nao foi possivel carregar o catalogo.',
            });
          },
        });
    };

    return {
      setSearchword(searchword: string): void {
        patchState(store, { searchword: searchword.trim() });
      },

      setCategory(categoryId: number | null): void {
        patchState(store, { categoryId, currentPage: 1 });
      },

      clearCategory(): void {
        patchState(store, { categoryId: null, currentPage: 1 });
      },

      loadProducts(query: PublicProductCatalogQuery = {}): void {
        loadProductsInternal(query);
      },

      loadProductsByCategory(categoryId: number, query: Pick<PublicProductCatalogQuery, 'page' | 'size'> = {}): void {
        patchState(store, { categoryId, currentPage: query.page ?? 1 });
        loadProductsInternal(query);
      },

      loadProductDetails(productId: number): void {
        detailSubscription?.unsubscribe();
        patchState(store, {
          isLoadingDetail: true,
          error: null,
        });

        detailSubscription = catalogService
          .getPublicProductById(productId)
          .pipe(finalize(() => { detailSubscription = null; }))
          .subscribe({
            next: (currentProduct) => {
              patchState(store, {
                currentProduct,
                isLoadingDetail: false,
                error: null,
              });
            },
            error: () => {
              patchState(store, {
                currentProduct: null,
                isLoadingDetail: false,
                error: 'Nao foi possivel carregar o produto.',
              });
            },
          });
      },

      clearCurrentProduct(): void {
        detailSubscription?.unsubscribe();
        detailSubscription = null;
        patchState(store, {
          currentProduct: null,
          isLoadingDetail: false,
          error: null,
        });
      },

      reset(): void {
        listSubscription?.unsubscribe();
        detailSubscription?.unsubscribe();
        listSubscription = null;
        detailSubscription = null;
        patchState(store, initialState);
      },
    };
  }),
);
