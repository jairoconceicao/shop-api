import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ApiClientService, normalizeResponseData, type ApiResponse } from '@shared/api';
import type { CartCreated } from '@shared/models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly apiClient = inject(ApiClientService);

  create(): Observable<CartCreated> {
    return this.apiClient
      .post<ApiResponse<CartCreated>, undefined>('/api/v1/carrinho/criar', undefined)
      .pipe(map((response) => normalizeResponseData(response)));
  }
}
