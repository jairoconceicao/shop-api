import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import {
  ApiClientService,
  normalizeResponseData,
  type ApiResponse,
  type PagedResponse,
} from '@shared/api';
import type { ProductCatalogItem, ProductDetails } from '@shared/models';

export interface PublicProductCatalogQuery {
  page?: number;
  size?: number;
  searchword?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  private readonly apiClient = inject(ApiClientService);

  listPublicProducts(
    query: PublicProductCatalogQuery = {},
  ): Observable<PagedResponse<ProductCatalogItem>> {
    return this.apiClient.get<PagedResponse<ProductCatalogItem>>('/api/v1/produto', {
      params: {
        page: query.page ?? 1,
        size: query.size ?? 4,
        searchword: query.searchword,
      },
    });
  }

  listPublicProductsByCategory(
    categoryId: number,
    query: Pick<PublicProductCatalogQuery, 'page' | 'size'> = {},
  ): Observable<PagedResponse<ProductCatalogItem>> {
    return this.apiClient.get<PagedResponse<ProductCatalogItem>>(
      `/api/v1/produto/categoria/${categoryId}`,
      {
        params: {
          page: query.page ?? 1,
          size: query.size ?? 4,
        },
      },
    );
  }

  getPublicProductById(productId: number): Observable<ProductDetails> {
    return this.apiClient
      .get<ApiResponse<ProductDetails>>(`/api/v1/produto/${productId}`)
      .pipe(map((response: ApiResponse<ProductDetails>) => normalizeResponseData(response)));
  }
}
