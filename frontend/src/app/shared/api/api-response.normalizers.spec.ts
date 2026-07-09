import { describe, expect, it } from 'vitest';

import { normalizePaginationData, normalizeResponseData } from './api-response.normalizers';
import type { ApiResponse, PagedResponse } from './api-response.model';

type ProductSummary = {
  produtoId: number;
  titulo: string;
};

describe('API response normalizers', () => {
  it('unwraps single-item data envelopes', () => {
    const response = {
      status: true,
      message: '',
      data: {
        produtoId: 1,
        titulo: 'Notebook Gamer',
      },
    } satisfies ApiResponse<ProductSummary>;

    const data = normalizeResponseData(response);

    expect(data).toBe(response.data);
    expect(data).toEqual(response.data);
    expect(data.titulo).toBe('Notebook Gamer');
  });

  it('unwraps paged envelopes preserving pagination metadata', () => {
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

    const pagination = normalizePaginationData(response);

    expect(pagination).toBe(response.pagination);
    expect(pagination).toEqual(response.pagination);
    expect(pagination.data).toHaveLength(1);
  });
});
