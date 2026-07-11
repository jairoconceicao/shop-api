import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ApiPagination } from '@shared/api';
import type { ProductCatalogItem } from '@shared/models';

import { createIncrementalSectionState } from './home-featured-products.context';

describe('createIncrementalSectionState', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('loads the first page and appends more products when requested', () => {
    const loader = vi.fn(({ page }) =>
      of(
        page === 1
          ? firstPageResponse
          : secondPageResponse,
      ),
    );

    const state = TestBed.runInInjectionContext(() =>
      createIncrementalSectionState(loader, 'Falha ao carregar a vitrine.'),
    );

    expect(loader).toHaveBeenCalledWith({ page: 1, size: 4 });
    expect(state.isLoading()).toBe(false);
    expect(state.error()).toBeNull();
    expect(state.items()).toEqual(firstPageResponse.data);
    expect(state.pagination()).toEqual({
      page: 1,
      size: 4,
      totalItems: 2,
      totalPages: 2,
    });
    expect(state.hasMore()).toBe(true);

    state.loadMore();

    expect(loader).toHaveBeenCalledWith({ page: 2, size: 4 });
    expect(state.items()).toEqual([
      ...firstPageResponse.data,
      ...secondPageResponse.data,
    ]);
    expect(state.pagination()).toEqual({
      page: 2,
      size: 4,
      totalItems: 2,
      totalPages: 2,
    });
    expect(state.hasMore()).toBe(false);
    expect(state.loadMoreError()).toBeNull();
  });

  it('keeps the current products when loading more fails', () => {
    const loader = vi.fn(({ page }) => {
      if (page === 1) {
        return of(firstPageResponse);
      }

      return throwError(() => new Error('failed to load more products'));
    });

    const state = TestBed.runInInjectionContext(() =>
      createIncrementalSectionState(loader, 'Falha ao carregar a vitrine.'),
    );

    state.loadMore();

    expect(state.items()).toEqual(firstPageResponse.data);
    expect(state.pagination()).toEqual({
      page: 1,
      size: 4,
      totalItems: 2,
      totalPages: 2,
    });
    expect(state.loadMoreError()).toBe('Falha ao carregar a vitrine.');
    expect(state.error()).toBeNull();
    expect(state.hasMore()).toBe(true);
  });
});

const firstPageResponse = {
  pages: 2,
  size: 4,
  totalItems: 2,
  data: [
    {
      produtoId: 101,
      titulo: 'Notebook Gamer',
      thumb: null,
      preco: 5999.9,
      estoque: 12,
      categoria: {
        categoriaId: 1,
        titulo: 'Informática',
      },
    },
  ],
} satisfies ApiPagination<ProductCatalogItem>;

const secondPageResponse = {
  pages: 2,
  size: 4,
  totalItems: 2,
  data: [
    {
      produtoId: 102,
      titulo: 'Keyboard Mecânico',
      thumb: null,
      preco: 499.9,
      estoque: 8,
      categoria: {
        categoriaId: 2,
        titulo: 'Periféricos',
      },
    },
  ],
} satisfies ApiPagination<ProductCatalogItem>;
