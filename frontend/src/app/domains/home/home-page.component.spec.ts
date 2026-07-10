import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';
import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CategoryService } from '@core/category/category.service';
import { CatalogService } from '@core/catalog/catalog.service';
import type { PagedResponse } from '@shared/api';
import type { Category, ProductCatalogItem } from '@shared/models';

import { HomePageComponent } from './home-page.component';

describe('HomePageComponent', () => {
  const catalogServiceMock = {
    listPublicProducts: vi.fn(),
  };

  const categoryServiceMock = {
    listPublicCategories: vi.fn(),
  };

  beforeEach(() => {
    catalogServiceMock.listPublicProducts.mockReset();
    categoryServiceMock.listPublicCategories.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the mobile first storefront sections', async () => {
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

    const categories = [
      {
        categoriaId: 1,
        titulo: 'Informática',
        descricao: 'Produtos de tecnologia',
      },
      {
        categoriaId: 2,
        titulo: 'Celulares',
        descricao: 'Smartphones e acessórios',
      },
    ] satisfies Category[];

    catalogServiceMock.listPublicProducts.mockReturnValue(of(response));
    categoryServiceMock.listPublicCategories.mockReturnValue(of(categories));

    await render(HomePageComponent, {
      providers: [
        provideRouter([]),
        {
          provide: CatalogService,
          useValue: catalogServiceMock,
        },
        {
          provide: CategoryService,
          useValue: categoryServiceMock,
        },
      ],
    });

    expect(screen.getByRole('heading', { name: /Sua vitrine mobile first/i })).toBeVisible();
    expect(screen.getByText('Ofertas da semana')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Explorar vitrine' })).toHaveAttribute(
      'href',
      '/products',
    );
    expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/login');
    expect(catalogServiceMock.listPublicProducts).toHaveBeenCalledWith();
    expect(categoryServiceMock.listPublicCategories).toHaveBeenCalledWith();
    expect(screen.getByRole('heading', { name: 'Notebook Gamer' })).toBeVisible();
    expect(screen.getAllByText('Informática')).toHaveLength(2);
    expect(screen.getByText('R$ 5.999,90')).toBeVisible();
    expect(screen.getByText('12 em estoque')).toBeVisible();
    expect(screen.getAllByRole('link', { name: 'Comprar' })).toHaveLength(1);
    expect(screen.getByText('Produtos em destaque')).toBeVisible();
    expect(screen.getByText('Produtos de tecnologia')).toBeVisible();
    expect(screen.getByText('Smartphones e acessórios')).toBeVisible();
  });
});
