import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiClientService, type ApiResponse } from '@shared/api';
import type { Category } from '@shared/models';

import { CategoryService } from './category.service';

describe('CategoryService', () => {
  const apiClientMock = {
    get: vi.fn(),
  };

  beforeEach(() => {
    apiClientMock.get.mockReset();

    TestBed.configureTestingModule({
      providers: [
        CategoryService,
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

  it('lists public categories through GET /api/v1/categoria', () => {
    const response = {
      status: true,
      message: 'Categorias carregadas com sucesso.',
      data: [
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
      ],
    } satisfies ApiResponse<Category[]>;

    apiClientMock.get.mockReturnValue(of(response));

    const service = TestBed.inject(CategoryService);
    const receivedResponses: Category[][] = [];

    service.listPublicCategories().subscribe((categories) => {
      receivedResponses.push(categories);
    });

    expect(apiClientMock.get).toHaveBeenCalledWith('/api/v1/categoria');
    expect(receivedResponses).toEqual([response.data]);
  });
});
