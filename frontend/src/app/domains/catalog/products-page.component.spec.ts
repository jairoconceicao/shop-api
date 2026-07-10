import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CatalogService } from '@core/catalog/catalog.service';
import type { PagedResponse } from '@shared/api';
import type { ProductCatalogItem } from '@shared/models';

import { ProductsPageComponent } from './products-page.component';

describe('ProductsPageComponent', () => {
  const catalogServiceMock = {
    listPublicProducts: vi.fn(),
  };

  beforeEach(() => {
    catalogServiceMock.listPublicProducts.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the public catalog and loads more products', async () => {
    const firstPage = {
      status: true,
      message: 'Catalogo de produtos carregado com sucesso.',
      pagination: {
        pages: 2,
        size: 8,
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
      },
    } satisfies PagedResponse<ProductCatalogItem>;

    const secondPage = {
      status: true,
      message: 'Catalogo de produtos carregado com sucesso.',
      pagination: {
        pages: 2,
        size: 8,
        totalItems: 2,
        data: [
          {
            produtoId: 102,
            titulo: 'Mouse Gamer',
            thumb: null,
            preco: 129.9,
            estoque: 20,
            categoria: {
              categoriaId: 2,
              titulo: 'Periféricos',
            },
          },
        ],
      },
    } satisfies PagedResponse<ProductCatalogItem>;

    catalogServiceMock.listPublicProducts
      .mockReturnValueOnce(of(firstPage))
      .mockReturnValueOnce(of(secondPage));

    await render(ProductsPageComponent, {
      providers: [
        provideRouter([]),
        {
          provide: CatalogService,
          useValue: catalogServiceMock,
        },
      ],
    });

    expect(screen.getByRole('heading', { name: /Explore produtos/i })).toBeVisible();
    expect(screen.getByText('Catalogo publico')).toBeVisible();
    expect(screen.getByText('Itens carregados')).toBeVisible();
    expect(screen.getByText('Publico')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Notebook Gamer' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Ver produto' })).toHaveAttribute(
      'href',
      '/products',
    );
    expect(screen.getByRole('button', { name: 'Ver mais produtos' })).toBeVisible();

    screen.getByRole('button', { name: 'Ver mais produtos' }).click();

    expect(catalogServiceMock.listPublicProducts).toHaveBeenNthCalledWith(2, {
      page: 2,
      size: 8,
    });
    expect(await screen.findByRole('heading', { name: 'Mouse Gamer' })).toBeVisible();
  });

  it('renders an empty state when the catalog has no products', async () => {
    catalogServiceMock.listPublicProducts.mockReturnValue(
      of({
        status: true,
        message: 'Catalogo vazio.',
        pagination: {
          pages: 0,
          size: 8,
          totalItems: 0,
          data: [],
        },
      }),
    );

    await render(ProductsPageComponent, {
      providers: [
        provideRouter([]),
        {
          provide: CatalogService,
          useValue: catalogServiceMock,
        },
      ],
    });

    expect(screen.getByText('Nenhum produto disponivel')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Voltar para home' })).toHaveAttribute('href', '/');
  });

  it('renders an error state when the catalog request fails', async () => {
    catalogServiceMock.listPublicProducts.mockReturnValue(
      throwError(() => new Error('failed to load catalog')),
    );

    await render(ProductsPageComponent, {
      providers: [
        provideRouter([]),
        {
          provide: CatalogService,
          useValue: catalogServiceMock,
        },
      ],
    });

    expect(screen.getByText('Nao foi possivel carregar os produtos')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Recarregar catalogo' })).toBeVisible();
  });
});
