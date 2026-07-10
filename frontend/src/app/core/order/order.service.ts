import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ApiClientService, normalizeResponseData, type ApiResponse } from '@shared/api';
import type { CreateOrderRequest, OrderCreated } from '@shared/models';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly apiClient = inject(ApiClientService);

  create(request: CreateOrderRequest): Observable<OrderCreated> {
    return this.apiClient
      .post<ApiResponse<OrderCreated>, CreateOrderRequest>('/api/v1/pedido', request)
      .pipe(map((response) => normalizeResponseData(response)));
  }
}
