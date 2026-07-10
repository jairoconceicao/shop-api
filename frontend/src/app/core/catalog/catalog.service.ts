import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService, type PagedResponse } from '@shared/api';
import type { ProductCatalogItem } from '@shared/models';

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
}
