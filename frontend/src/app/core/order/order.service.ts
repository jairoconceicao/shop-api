import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import {
  ApiClientService,
  normalizePaginationData,
  normalizeResponseData,
  type ApiPagination,
  type ApiResponse,
  type PagedResponse,
} from '@shared/api';
import type {
  CreateOrderRequest,
  Order,
  OrderCanceled,
  OrderCreated,
  OrderListParams,
} from '@shared/models';

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

  list(params: OrderListParams): Observable<ApiPagination<Order>> {
    return this.apiClient
      .get<PagedResponse<Order>>('/api/v1/pedido', {
        params: {
          cpf: params.cpf,
          dataInicio: params.dataInicio,
          dataFim: params.dataFim,
          page: params.page,
          size: params.size,
        },
      })
      .pipe(map((response) => normalizePaginationData(response)));
  }

  getById(pedidoId: number | string): Observable<Order> {
    return this.apiClient
      .get<ApiResponse<Order>>(`/api/v1/pedido/${pedidoId}`)
      .pipe(map((response) => normalizeResponseData(response)));
  }

  cancel(pedidoId: number | string): Observable<OrderCanceled> {
    return this.apiClient
      .patch<ApiResponse<OrderCanceled>, { status: string }>(`/api/v1/pedido/${pedidoId}`, {
        status: 'Cancelado',
      })
      .pipe(map((response) => normalizeResponseData(response)));
  }
}
