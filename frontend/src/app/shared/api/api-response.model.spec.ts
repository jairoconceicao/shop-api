import { describe, expect, it } from 'vitest';

import type { ApiResponse, PagedResponse } from './api-response.model';

type ProductSummary = {
  produtoId: number;
  titulo: string;
};

describe('API response models', () => {
  it('models a single-item envelope', () => {
    const response = {
      status: true,
      message: '',
      data: {
        produtoId: 1,
        titulo: 'Notebook Gamer',
      },
    } satisfies ApiResponse<ProductSummary>;

    expect(response.status).toBe(true);
    expect(response.data.titulo).toBe('Notebook Gamer');
  });

  it('models a paged envelope', () => {
    const response = {
      status: true,
      message: '',
      pagination: {
        pages: 1,
        size: 20,
        totalItems: 1,
        data: [
          {
            produtoId: 1,
            titulo: 'Notebook Gamer',
          },
        ],
      },
    } satisfies PagedResponse<ProductSummary>;

    expect(response.pagination.totalItems).toBe(1);
    expect(response.pagination.data).toHaveLength(1);
  });
});
