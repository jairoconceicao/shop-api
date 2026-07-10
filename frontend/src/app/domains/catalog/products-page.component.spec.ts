import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { fireEvent, render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { CategoryService } from '@core/category/category.service';
import { CatalogService } from '@core/catalog/catalog.service';
import type { PagedResponse } from '@shared/api';
import type { Category, ProductCatalogItem } from '@shared/models';

import { ProductsPageComponent } from './products-page.component';

describe('ProductsPageComponent', () => {
  const catalogServiceMock = {
    listPublicProducts: vi.fn(),
    listPublicProductsByCategory: vi.fn(),
  };

  const categoryServiceMock = {
    listPublicCategories: vi.fn(),
  };

  beforeEach(() => {
    catalogServiceMock.listPublicProducts.mockReset();
    catalogServiceMock.listPublicProductsByCategory.mockReset();
    categoryServiceMock.listPublicCategories.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  function createActivatedRoute(queryParams: Record<string, string> = {}): ActivatedRoute {
    const queryParamMap = convertToParamMap(queryParams);

    return {
      snapshot: {
        queryParamMap,
      } as ActivatedRoute['snapshot'],
      queryParamMap: of(queryParamMap),
    } as ActivatedRoute;
  }

  it('renders the public catalog and loads more products', async () => {
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
    categoryServiceMock.listPublicCategories.mockReturnValue(of(categories));

    await render(ProductsPageComponent, {
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: createActivatedRoute(),
        },
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

    expect(screen.getByRole('heading', { name: /Explore produtos/i })).toBeVisible();
    expect(screen.getByText('Catalogo publico')).toBeVisible();
    expect(screen.getByLabelText('Página 1')).toBeVisible();
    expect(screen.getByLabelText('Tamanho 8')).toBeVisible();
    expect(screen.getByLabelText('Total de itens 2')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Todas' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Celulares' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Notebook Gamer' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Ver produto' })).toHaveAttribute(
      'href',
      '/products/101',
    );
    expect(screen.getByRole('button', { name: 'Ver mais produtos' })).toBeVisible();
    expect(categoryServiceMock.listPublicCategories).toHaveBeenCalledWith();

    fireEvent.click(screen.getByRole('button', { name: 'Ver mais produtos' }));

    expect(catalogServiceMock.listPublicProducts).toHaveBeenNthCalledWith(2, {
      page: 2,
      size: 8,
      searchword: undefined,
    });
    expect(screen.getByLabelText('Página 2')).toBeVisible();
    expect(await screen.findByRole('heading', { name: 'Mouse Gamer' })).toBeVisible();
  });

  it('loads the catalog by category through the dedicated endpoint', async () => {
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

    const initialPage = {
      status: true,
      message: 'Catalogo de produtos carregado com sucesso.',
      pagination: {
        pages: 1,
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

    const categoryPage = {
      status: true,
      message: 'Catalogo de produtos carregado com sucesso.',
      pagination: {
        pages: 1,
        size: 8,
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

    catalogServiceMock.listPublicProducts.mockReturnValueOnce(of(initialPage));
    catalogServiceMock.listPublicProductsByCategory.mockReturnValueOnce(of(categoryPage));
    categoryServiceMock.listPublicCategories.mockReturnValue(of(categories));

    await render(ProductsPageComponent, {
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: createActivatedRoute(),
        },
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

    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fireEvent.click(screen.getByRole('button', { name: 'Celulares' }));

    expect(catalogServiceMock.listPublicProductsByCategory).toHaveBeenCalledWith(2, {
      page: 1,
      size: 8,
    });
    expect(screen.getByRole('heading', { name: 'Smartphone Gamer' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Notebook Gamer' })).not.toBeInTheDocument();
    expect(screen.getByText('Filtrando por Celulares')).toBeVisible();
  });

  it('submits the search term using the searchword query', async () => {
    const firstPage = {
      status: true,
      message: 'Catalogo de produtos carregado com sucesso.',
      pagination: {
        pages: 1,
        size: 8,
        totalItems: 1,
        data: [],
      },
    } satisfies PagedResponse<ProductCatalogItem>;

    const searchedPage = {
      status: true,
      message: 'Catalogo de produtos carregado com sucesso.',
      pagination: {
        pages: 1,
        size: 8,
        totalItems: 1,
        data: [
          {
            produtoId: 202,
            titulo: 'Notebook Gamer Pro',
            thumb: null,
            preco: 7999.9,
            estoque: 4,
            categoria: {
              categoriaId: 1,
              titulo: 'Informática',
            },
          },
        ],
      },
    } satisfies PagedResponse<ProductCatalogItem>;

    catalogServiceMock.listPublicProducts
      .mockReturnValueOnce(of(firstPage))
      .mockReturnValueOnce(of(searchedPage));
    categoryServiceMock.listPublicCategories.mockReturnValue(of([]));

    await render(ProductsPageComponent, {
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: createActivatedRoute(),
        },
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

    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const searchInput = screen.getByLabelText('Buscar produtos');
    fireEvent.input(searchInput, { target: { value: 'notebook gamer' } });
    fireEvent.submit(searchInput.closest('form') as HTMLFormElement);

    expect(catalogServiceMock.listPublicProducts).toHaveBeenNthCalledWith(2, {
      page: 1,
      size: 8,
      searchword: 'notebook gamer',
    });
    expect(await screen.findByRole('heading', { name: 'Notebook Gamer Pro' })).toBeVisible();
  });

  it('keeps the search term when the user searches and then applies a category filter', async () => {
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

    const initialPage = {
      status: true,
      message: 'Catalogo de produtos carregado com sucesso.',
      pagination: {
        pages: 1,
        size: 8,
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

    const searchedPage = {
      status: true,
      message: 'Catalogo de produtos carregado com sucesso.',
      pagination: {
        pages: 1,
        size: 8,
        totalItems: 1,
        data: [
          {
            produtoId: 202,
            titulo: 'Notebook Gamer Pro',
            thumb: null,
            preco: 7999.9,
            estoque: 4,
            categoria: {
              categoriaId: 1,
              titulo: 'Informática',
            },
          },
        ],
      },
    } satisfies PagedResponse<ProductCatalogItem>;

    const categoryPage = {
      status: true,
      message: 'Catalogo de produtos carregado com sucesso.',
      pagination: {
        pages: 1,
        size: 8,
        totalItems: 1,
        data: [
          {
            produtoId: 303,
            titulo: 'Smartphone Gamer',
            thumb: null,
            preco: 4999.9,
            estoque: 9,
            categoria: {
              categoriaId: 2,
              titulo: 'Celulares',
            },
          },
        ],
      },
    } satisfies PagedResponse<ProductCatalogItem>;

    catalogServiceMock.listPublicProducts
      .mockReturnValueOnce(of(initialPage))
      .mockReturnValueOnce(of(searchedPage));
    catalogServiceMock.listPublicProductsByCategory.mockReturnValueOnce(of(categoryPage));
    categoryServiceMock.listPublicCategories.mockReturnValue(of(categories));

    await render(ProductsPageComponent, {
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: createActivatedRoute(),
        },
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

    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const searchInput = screen.getByLabelText('Buscar produtos');
    fireEvent.input(searchInput, { target: { value: 'notebook gamer' } });
    fireEvent.submit(searchInput.closest('form') as HTMLFormElement);

    expect(catalogServiceMock.listPublicProducts).toHaveBeenNthCalledWith(2, {
      page: 1,
      size: 8,
      searchword: 'notebook gamer',
    });
    expect(await screen.findByRole('heading', { name: 'Notebook Gamer Pro' })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Celulares' }));

    expect(navigateSpy).toHaveBeenLastCalledWith(['/products'], {
      queryParams: {
        searchword: 'notebook gamer',
        categoriaId: 2,
      },
      queryParamsHandling: 'merge',
    });
    expect(catalogServiceMock.listPublicProductsByCategory).toHaveBeenCalledWith(2, {
      page: 1,
      size: 8,
    });
    expect(await screen.findByRole('heading', { name: 'Smartphone Gamer' })).toBeVisible();
    expect(screen.getByLabelText('Buscar produtos')).toHaveValue('notebook gamer');
    expect(screen.getByText('Filtrando por Celulares')).toBeVisible();
  });

  it('restores the catalog state from the URL query params on load', async () => {
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

    const categoryPage = {
      status: true,
      message: 'Catalogo de produtos carregado com sucesso.',
      pagination: {
        pages: 1,
        size: 8,
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

    catalogServiceMock.listPublicProductsByCategory.mockReturnValue(of(categoryPage));
    categoryServiceMock.listPublicCategories.mockReturnValue(of(categories));

    await render(ProductsPageComponent, {
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: createActivatedRoute({
            searchword: 'notebook gamer',
            categoriaId: '2',
          }),
        },
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

    expect(catalogServiceMock.listPublicProductsByCategory).toHaveBeenCalledWith(2, {
      page: 1,
      size: 8,
    });
    expect(screen.getByLabelText('Buscar produtos')).toHaveValue('notebook gamer');
    expect(screen.getByRole('button', { name: 'Celulares' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByText('Filtrando por Celulares')).toBeVisible();
  });

  it('preserves the current filters in the URL when the user searches or changes category', async () => {
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

    const initialPage = {
      status: true,
      message: 'Catalogo de produtos carregado com sucesso.',
      pagination: {
        pages: 1,
        size: 8,
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

    catalogServiceMock.listPublicProducts.mockReturnValue(of(initialPage));
    categoryServiceMock.listPublicCategories.mockReturnValue(of(categories));

    await render(ProductsPageComponent, {
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: createActivatedRoute({ searchword: 'notebook gamer' }),
        },
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

    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fireEvent.click(screen.getByRole('button', { name: 'Celulares' }));

    expect(navigateSpy).toHaveBeenCalledWith(['/products'], {
      queryParams: {
        searchword: 'notebook gamer',
        categoriaId: 2,
      },
      queryParamsHandling: 'merge',
    });

    const searchInput = screen.getByLabelText('Buscar produtos');
    fireEvent.input(searchInput, { target: { value: 'notebook gamer pro' } });
    fireEvent.submit(searchInput.closest('form') as HTMLFormElement);

    expect(navigateSpy).toHaveBeenLastCalledWith(['/products'], {
      queryParams: {
        searchword: 'notebook gamer pro',
        categoriaId: 2,
      },
      queryParamsHandling: 'merge',
    });
    expect(catalogServiceMock.listPublicProductsByCategory).toHaveBeenCalledWith(2, {
      page: 1,
      size: 8,
    });
  });

  it('renders an empty state when the catalog has no products', async () => {
    categoryServiceMock.listPublicCategories.mockReturnValue(of([]));
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
          provide: ActivatedRoute,
          useValue: createActivatedRoute(),
        },
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

    expect(screen.getByText('Nenhum produto disponivel')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Voltar para home' })).toHaveAttribute('href', '/');
  });

  it('renders a recoverable empty state when a filtered catalog has no products', async () => {
    categoryServiceMock.listPublicCategories.mockReturnValue(of([]));
    catalogServiceMock.listPublicProducts
      .mockReturnValueOnce(
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
      )
      .mockReturnValueOnce(
        of({
          status: true,
          message: 'Catalogo de produtos carregado com sucesso.',
          pagination: {
            pages: 1,
            size: 8,
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
        }),
      );

    await render(ProductsPageComponent, {
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: createActivatedRoute({
            searchword: 'notebook',
          }),
        },
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

    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    expect(screen.getByText('Nenhum resultado para "notebook"')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Limpar filtros' })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }));

    expect(catalogServiceMock.listPublicProducts).toHaveBeenNthCalledWith(2, {
      page: 1,
      size: 8,
      searchword: undefined,
    });
    expect(await screen.findByRole('heading', { name: 'Notebook Gamer' })).toBeVisible();
  });

  it('renders an error state when the catalog request fails', async () => {
    categoryServiceMock.listPublicCategories.mockReturnValue(of([]));
    catalogServiceMock.listPublicProducts.mockReturnValue(
      throwError(() => new Error('failed to load catalog')),
    );

    await render(ProductsPageComponent, {
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: createActivatedRoute(),
        },
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

    expect(screen.getByText('Nao foi possivel carregar os produtos')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Recarregar catalogo' })).toBeVisible();
  });

  it('renders a recoverable error state when a filtered catalog request fails', async () => {
    categoryServiceMock.listPublicCategories.mockReturnValue(of([]));
    catalogServiceMock.listPublicProducts
      .mockReturnValueOnce(throwError(() => new Error('failed to load catalog')))
      .mockReturnValueOnce(
        of({
          status: true,
          message: 'Catalogo de produtos carregado com sucesso.',
          pagination: {
            pages: 1,
            size: 8,
            totalItems: 1,
            data: [
              {
                produtoId: 202,
                titulo: 'Notebook Gamer Pro',
                thumb: null,
                preco: 7999.9,
                estoque: 4,
                categoria: {
                  categoriaId: 1,
                  titulo: 'Informática',
                },
              },
            ],
          },
        }),
      );

    await render(ProductsPageComponent, {
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: createActivatedRoute({
            searchword: 'notebook',
          }),
        },
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

    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    expect(screen.getByText('Nao foi possivel carregar os produtos')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Recarregar catalogo' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Limpar filtros' })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }));

    expect(catalogServiceMock.listPublicProducts).toHaveBeenNthCalledWith(2, {
      page: 1,
      size: 8,
      searchword: undefined,
    });
    expect(await screen.findByRole('heading', { name: 'Notebook Gamer Pro' })).toBeVisible();
  });
});
