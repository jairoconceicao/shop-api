import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TokenStorageService } from '@core/auth/token-storage.service';
import { CatalogService } from '@core/catalog/catalog.service';

import { ProductDetailsPageComponent } from './product-details-page.component';

describe('ProductDetailsPageComponent', () => {
  const catalogServiceMock = {
    getPublicProductById: vi.fn(),
  };
  const tokenStorageMock = {
    hasToken: vi.fn(),
  };

  beforeEach(() => {
    catalogServiceMock.getPublicProductById.mockReset();
    tokenStorageMock.hasToken.mockReset();
  });

  function createActivatedRoute(productId = '101'): ActivatedRoute {
    const paramMap = convertToParamMap({ id: productId });

    return {
      snapshot: {
        paramMap,
      } as ActivatedRoute['snapshot'],
      paramMap: of(paramMap),
    } as ActivatedRoute;
  }

  it('renders the product details returned by the API', async () => {
    catalogServiceMock.getPublicProductById.mockReturnValue(
      of({
        produtoId: 101,
        titulo: 'Notebook Gamer',
        descricao: 'Notebook para jogos',
        modelo: 'RTX',
        foto: 'https://cdn.shopapi.dev/notebook.jpg',
        preco: 5999.9,
        estoque: 12,
        categoria: {
          categoriaId: 1,
          titulo: 'Informática',
        },
      }),
    );

    await render(ProductDetailsPageComponent, {
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
          provide: TokenStorageService,
          useValue: tokenStorageMock,
        },
      ],
    });

    expect(catalogServiceMock.getPublicProductById).toHaveBeenCalledWith(101);
    expect(screen.getByRole('heading', { name: 'Notebook Gamer' })).toBeVisible();
    expect(screen.getByRole('img', { name: 'Notebook Gamer' })).toBeVisible();
    expect(screen.getByText('Informática')).toBeVisible();
    expect(screen.getByText('R$ 5.999,90')).toBeVisible();
    expect(screen.getByText('Notebook para jogos')).toBeVisible();
    expect(screen.getByText('RTX')).toBeVisible();
    expect(screen.getByText('12 em estoque')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Comprar agora' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Adicionar ao carrinho' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Voltar ao catalogo' })).toHaveAttribute(
      'href',
      '/products',
    );
  });

  it('renders the unavailable state when the product has no stock', async () => {
    catalogServiceMock.getPublicProductById.mockReturnValue(
      of({
        produtoId: 101,
        titulo: 'Notebook Gamer',
        descricao: 'Notebook para jogos',
        modelo: 'RTX',
        foto: null,
        preco: 5999.9,
        estoque: 0,
        categoria: {
          categoriaId: 1,
          titulo: 'Informática',
        },
      }),
    );

    await render(ProductDetailsPageComponent, {
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
          provide: TokenStorageService,
          useValue: tokenStorageMock,
        },
      ],
    });

    expect(catalogServiceMock.getPublicProductById).toHaveBeenCalledWith(101);
    expect(screen.getByRole('heading', { name: 'Notebook Gamer' })).toBeVisible();
    expect(screen.getAllByText('Sem estoque').length).toBeGreaterThan(0);
    expect(screen.getByText('Produto sem estoque.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Avise-me quando chegar' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Comprar agora' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Adicionar ao carrinho' })).toBeNull();
  });

  it('renders an error state when the API fails', async () => {
    catalogServiceMock.getPublicProductById.mockReturnValue(
      throwError(() => new Error('failed to load product')),
    );

    await render(ProductDetailsPageComponent, {
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
          provide: TokenStorageService,
          useValue: tokenStorageMock,
        },
      ],
    });

    expect(screen.getByRole('alert')).toHaveTextContent('Nao foi possivel carregar o produto');
    expect(screen.getByRole('link', { name: 'Voltar ao catalogo' })).toHaveAttribute(
      'href',
      '/products',
    );
  });

  it('redirects anonymous users to login when they start purchase', async () => {
    tokenStorageMock.hasToken.mockReturnValue(false);
    catalogServiceMock.getPublicProductById.mockReturnValue(
      of({
        produtoId: 101,
        titulo: 'Notebook Gamer',
        descricao: 'Notebook para jogos',
        modelo: 'RTX',
        foto: 'https://cdn.shopapi.dev/notebook.jpg',
        preco: 5999.9,
        estoque: 12,
        categoria: {
          categoriaId: 1,
          titulo: 'Informática',
        },
      }),
    );

    await render(ProductDetailsPageComponent, {
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
          provide: TokenStorageService,
          useValue: tokenStorageMock,
        },
      ],
    });

    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    screen.getByRole('button', { name: 'Comprar agora' }).click();

    expect(navigateSpy).toHaveBeenCalledWith(['/login'], {
      queryParams: {
        returnUrl: '/products/101',
      },
    });
  });
});
