import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiClientService, type PagedResponse } from '@shared/api';
import type { ProductCatalogItem, ProductDetails } from '@shared/models';

import { CatalogService } from './catalog.service';

describe('CatalogService', () => {
  const apiClientMock = {
    get: vi.fn(),
  };

  beforeEach(() => {
    apiClientMock.get.mockReset();

    TestBed.configureTestingModule({
      providers: [
        CatalogService,
        {
          provide: ApiClientService,
          useValue: apiClientMock,
        },
      ],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('lists public products through GET /api/v1/produto', () => {
    const response = {
      status: true,
      message: 'Catalogo de produtos carregado com sucesso.',
      pagination: {
        pages: 1,
        size: 4,
        totalItems: 1,
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
      },
    } satisfies PagedResponse<ProductCatalogItem>;

    apiClientMock.get.mockReturnValue(of(response));

    const service = TestBed.inject(CatalogService);
    const receivedResponses: PagedResponse<ProductCatalogItem>[] = [];

    service.listPublicProducts().subscribe((catalog) => {
      receivedResponses.push(catalog);
    });

    expect(apiClientMock.get).toHaveBeenCalledWith('/api/v1/produto', {
      params: {
        page: 1,
        size: 4,
        searchword: undefined,
      },
    });
    expect(receivedResponses).toEqual([response]);
  });

  it('lists public products by category through GET /api/v1/produto/categoria/{categoriaId}', () => {
    const response = {
      status: true,
      message: 'Catalogo de produtos carregado com sucesso.',
      pagination: {
        pages: 1,
        size: 4,
        totalItems: 1,
        data: [
          {
            produtoId: 202,
            titulo: 'Smartphone Gamer',
            thumb: null,
            preco: 3999.9,
            estoque: 7,
            categoria: {
              categoriaId: 2,
              titulo: 'Celulares',
            },
          },
        ],
      },
    } satisfies PagedResponse<ProductCatalogItem>;

    apiClientMock.get.mockReturnValue(of(response));

    const service = TestBed.inject(CatalogService);
    const receivedResponses: PagedResponse<ProductCatalogItem>[] = [];

    service.listPublicProductsByCategory(2).subscribe((catalog) => {
      receivedResponses.push(catalog);
    });

    expect(apiClientMock.get).toHaveBeenCalledWith('/api/v1/produto/categoria/2', {
      params: {
        page: 1,
        size: 4,
      },
    });
    expect(receivedResponses).toEqual([response]);
  });

  it('loads a public product by id through GET /api/v1/produto/{id}', () => {
    const response = {
      status: true,
      message: 'Produto carregado com sucesso.',
      data: {
        produtoId: 101,
        titulo: 'Notebook Gamer',
        descricao: 'Notebook para jogos',
        modelo: 'RTX',
        foto: null,
        preco: 5999.9,
        estoque: 12,
        categoria: {
          categoriaId: 1,
          titulo: 'Informática',
        },
      },
    } satisfies { status: boolean; message: string; data: ProductDetails };

    apiClientMock.get.mockReturnValue(of(response));

    const service = TestBed.inject(CatalogService);
    const receivedResponses: ProductDetails[] = [];

    service.getPublicProductById(101).subscribe((product) => {
      receivedResponses.push(product);
    });

    expect(apiClientMock.get).toHaveBeenCalledWith('/api/v1/produto/101');
    expect(receivedResponses).toEqual([response.data]);
  });
});
