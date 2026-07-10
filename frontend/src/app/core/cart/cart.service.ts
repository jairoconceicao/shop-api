import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ApiClientService, normalizeResponseData, type ApiResponse } from '@shared/api';
import type {
  AddCartItemRequest,
  AddCartItemResponse,
  Cart,
  CartCreated,
  EntityId,
  UpdateCartItemRequest,
} from '@shared/models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly apiClient = inject(ApiClientService);

  create(): Observable<CartCreated> {
    return this.apiClient
      .post<ApiResponse<CartCreated>, undefined>('/api/v1/carrinho/criar', undefined)
      .pipe(map((response) => normalizeResponseData(response)));
  }

  getById(carrinhoId: EntityId): Observable<Cart> {
    return this.apiClient
      .get<ApiResponse<Cart>>(`/api/v1/carrinho/${carrinhoId}`)
      .pipe(map((response) => normalizeResponseData(response)));
  }

  addItem(request: AddCartItemRequest): Observable<AddCartItemResponse> {
    return this.apiClient
      .post<ApiResponse<AddCartItemResponse>, AddCartItemRequest>('/api/v1/carrinho/items', request)
      .pipe(map((response) => normalizeResponseData(response)));
  }

  updateItemQuantity(itemId: EntityId, request: UpdateCartItemRequest): Observable<AddCartItemResponse> {
    return this.apiClient
      .patch<ApiResponse<AddCartItemResponse>, UpdateCartItemRequest>(
        `/api/v1/carrinho/items/${itemId}`,
        request,
      )
      .pipe(map((response) => normalizeResponseData(response)));
  }

  deleteItem(itemId: EntityId): Observable<void> {
    return this.apiClient.delete<ApiResponse<void>>(`/api/v1/carrinho/items/${itemId}`).pipe(
      map((response) => normalizeResponseData(response)),
    );
  }
}
