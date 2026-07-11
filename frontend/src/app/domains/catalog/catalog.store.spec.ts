import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CatalogService } from '@core/catalog/catalog.service';
import type { ApiPagination } from '@shared/api';
import type { ProductCatalogItem, ProductDetails } from '@shared/models';
import { resetStoreTestBed } from '../testing/store-test.context';

import { CatalogStore } from './catalog.store';

describe('CatalogStore', () => {
  const catalogServiceMock = {
    listPublicProducts: vi.fn(),
    listPublicProductsByCategory: vi.fn(),
    getPublicProductById: vi.fn(),
  };

  const product = (overrides: Partial<ProductCatalogItem> = {}): ProductCatalogItem => ({
    produtoId: 1,
    titulo: 'Notebook Ultra',
    thumb: null,
    preco: 3499.9,
    estoque: 10,
    categoria: null,
    ...overrides,
  });

  const details = (overrides: Partial<ProductDetails> = {}): ProductDetails => ({
    produtoId: 1,
    titulo: 'Notebook Ultra',
    descricao: 'Descricao do produto',
    modelo: 'Ultra 15',
    foto: null,
    preco: 3499.9,
    estoque: 10,
    categoria: null,
    ...overrides,
  });

  beforeEach(() => {
    catalogServiceMock.listPublicProducts.mockReset();
    catalogServiceMock.listPublicProductsByCategory.mockReset();
    catalogServiceMock.getPublicProductById.mockReset();

    TestBed.configureTestingModule({
      providers: [
        CatalogStore,
        { provide: CatalogService, useValue: catalogServiceMock },
      ],
    });
  });

  afterEach(() => {
    resetStoreTestBed();
  });

  it('starts empty and exposes derived state', () => {
    const store = TestBed.inject(CatalogStore);

    expect(store.hasProducts()).toBe(false);
    expect(store.isEmpty()).toBe(true);
    expect(store.products()).toEqual([]);
    expect(store.currentProduct()).toBeNull();
    expect(store.currentPage()).toBe(1);
    expect(store.pageSize()).toBe(12);
    expect(store.totalItems()).toBe(0);
    expect(store.totalPages()).toBe(0);
    expect(store.searchword()).toBe('');
    expect(store.categoryId()).toBeNull();
    expect(store.isLoading()).toBe(false);
    expect(store.isLoadingDetail()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('loads public products and updates pagination state', () => {
    const products = [product(), product({ produtoId: 2 })];
    catalogServiceMock.listPublicProducts.mockReturnValue(
      of({ pages: 2, size: 12, totalItems: 24, data: products } satisfies ApiPagination<ProductCatalogItem>),
    );

    const store = TestBed.inject(CatalogStore);

    store.loadProducts({ page: 2, size: 12, searchword: 'notebook' });

    expect(catalogServiceMock.listPublicProducts).toHaveBeenCalledWith({
      page: 2,
      size: 12,
      searchword: 'notebook',
    });
    expect(store.products()).toEqual(products);
    expect(store.totalItems()).toBe(24);
    expect(store.totalPages()).toBe(2);
    expect(store.currentPage()).toBe(2);
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('loads products by category and updates the selected category', () => {
    catalogServiceMock.listPublicProductsByCategory.mockReturnValue(
      of({ pages: 1, size: 12, totalItems: 1, data: [product()] } satisfies ApiPagination<ProductCatalogItem>),
    );

    const store = TestBed.inject(CatalogStore);

    store.loadProductsByCategory(3, { page: 1, size: 12 });

    expect(catalogServiceMock.listPublicProductsByCategory).toHaveBeenCalledWith(3, {
      page: 1,
      size: 12,
    });
    expect(store.categoryId()).toBe(3);
    expect(store.products()).toHaveLength(1);
  });

  it('trims the search term and updates category filters independently', () => {
    const store = TestBed.inject(CatalogStore);

    store.setSearchword('  notebook  ');
    store.setCategory(9);
    store.clearCategory();

    expect(store.searchword()).toBe('notebook');
    expect(store.categoryId()).toBeNull();
    expect(store.currentPage()).toBe(1);
  });

  it('sets an error state when loading the catalog fails', () => {
    catalogServiceMock.listPublicProducts.mockReturnValue(throwError(() => new Error('fail')));

    const store = TestBed.inject(CatalogStore);

    store.loadProducts();

    expect(store.products()).toEqual([]);
    expect(store.totalItems()).toBe(0);
    expect(store.totalPages()).toBe(0);
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBe('Nao foi possivel carregar o catalogo.');
  });

  it('loads product details and stores the selected item', () => {
    catalogServiceMock.getPublicProductById.mockReturnValue(of(details()));

    const store = TestBed.inject(CatalogStore);

    store.loadProductDetails(1);

    expect(catalogServiceMock.getPublicProductById).toHaveBeenCalledWith(1);
    expect(store.currentProduct()).toEqual(details());
    expect(store.isLoadingDetail()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('sets an error state when loading product details fails', () => {
    catalogServiceMock.getPublicProductById.mockReturnValue(throwError(() => new Error('fail')));

    const store = TestBed.inject(CatalogStore);

    store.loadProductDetails(1);

    expect(store.currentProduct()).toBeNull();
    expect(store.isLoadingDetail()).toBe(false);
    expect(store.error()).toBe('Nao foi possivel carregar o produto.');
  });

  it('clears the selected product and resets the store', () => {
    catalogServiceMock.getPublicProductById.mockReturnValue(of(details()));
    catalogServiceMock.listPublicProducts.mockReturnValue(
      of({ pages: 1, size: 12, totalItems: 1, data: [product()] } satisfies ApiPagination<ProductCatalogItem>),
    );

    const store = TestBed.inject(CatalogStore);

    store.loadProducts();
    store.loadProductDetails(1);
    store.clearCurrentProduct();

    expect(store.currentProduct()).toBeNull();
    expect(store.isLoadingDetail()).toBe(false);

    store.reset();

    expect(store.products()).toEqual([]);
    expect(store.categoryId()).toBeNull();
    expect(store.searchword()).toBe('');
    expect(store.error()).toBeNull();
  });
});
