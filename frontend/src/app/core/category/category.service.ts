import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ApiClientService, normalizeResponseData, type ApiResponse } from '@shared/api';
import type { Category } from '@shared/models';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly apiClient = inject(ApiClientService);

  listPublicCategories(): Observable<Category[]> {
    return this.apiClient
      .get<ApiResponse<Category[]>>('/api/v1/categoria')
      .pipe(map((response: ApiResponse<Category[]>) => normalizeResponseData(response)));
  }
}
