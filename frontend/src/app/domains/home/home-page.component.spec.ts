import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';
import { Subject, of, throwError } from 'rxjs';
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

  it('renders loading states while the API requests are pending', async () => {
    const categoriesSubject = new Subject<Category[]>();
    const productsSubject = new Subject<PagedResponse<ProductCatalogItem>>();

    catalogServiceMock.listPublicProducts.mockReturnValue(productsSubject.asObservable());
    categoryServiceMock.listPublicCategories.mockReturnValue(categoriesSubject.asObservable());

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

    expect(screen.getByText('Carregando categorias')).toBeVisible();
    expect(screen.getByText('Preparando a navegação')).toBeVisible();
    expect(screen.getByText('Carregando vitrine')).toBeVisible();
    expect(screen.getByText('Preparando os produtos')).toBeVisible();
  });

  it('renders empty states when the API returns no categories or products', async () => {
    catalogServiceMock.listPublicProducts.mockReturnValue(
      of({
        status: true,
        message: 'Vitrine vazia.',
        pagination: {
          pages: 0,
          size: 4,
          totalItems: 0,
          data: [],
        },
      }),
    );
    categoryServiceMock.listPublicCategories.mockReturnValue(of([]));

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

    expect(screen.getByText('Nenhuma categoria disponivel')).toBeVisible();
    expect(screen.getByText('Vitrine vazia')).toBeVisible();
    expect(screen.getByText('Nenhum produto em destaque')).toBeVisible();
    expect(screen.getAllByRole('link', { name: 'Explorar produtos' })).toHaveLength(2);
  });

  it('renders error states and recovery actions when the API fails', async () => {
    catalogServiceMock.listPublicProducts.mockReturnValue(
      throwError(() => new Error('failed to load featured products')),
    );
    categoryServiceMock.listPublicCategories.mockReturnValue(
      throwError(() => new Error('failed to load categories')),
    );

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

    expect(screen.getByText('Nao foi possivel carregar as categorias')).toBeVisible();
    expect(screen.getByText('Nao foi possivel carregar os produtos')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Recarregar categorias' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Recarregar vitrine' })).toBeVisible();
  });
});
