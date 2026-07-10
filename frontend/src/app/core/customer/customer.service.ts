import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ApiClientService, normalizeResponseData, type ApiResponse } from '@shared/api';
import type {
  CustomerCreateRequest,
  CustomerDetails,
  CustomerIdResponse,
  CustomerUpdatePasswordRequest,
  CustomerUpdateRequest,
} from '@shared/models';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private readonly apiClient = inject(ApiClientService);

  create(request: CustomerCreateRequest): Observable<CustomerIdResponse> {
    return this.apiClient
      .post<ApiResponse<CustomerIdResponse>, CustomerCreateRequest>('/api/v1/cliente', request)
      .pipe(map((response: ApiResponse<CustomerIdResponse>) => normalizeResponseData(response)));
  }

  getById(clienteId: number): Observable<CustomerDetails> {
    return this.apiClient
      .get<ApiResponse<CustomerDetails>>(`/api/v1/cliente/${clienteId}`)
      .pipe(map((response: ApiResponse<CustomerDetails>) => normalizeResponseData(response)));
  }

  update(clienteId: number, request: CustomerUpdateRequest): Observable<CustomerDetails> {
    return this.apiClient
      .put<ApiResponse<CustomerDetails>, CustomerUpdateRequest>(`/api/v1/cliente/${clienteId}`, request)
      .pipe(map((response: ApiResponse<CustomerDetails>) => normalizeResponseData(response)));
  }

  updatePassword(clienteId: number, request: CustomerUpdatePasswordRequest): Observable<CustomerIdResponse> {
    return this.apiClient
      .put<ApiResponse<CustomerIdResponse>, CustomerUpdatePasswordRequest>(`/api/v1/cliente/${clienteId}/senha`, request)
      .pipe(map((response: ApiResponse<CustomerIdResponse>) => normalizeResponseData(response)));
  }

  delete(clienteId: number): Observable<void> {
    return this.apiClient
      .delete<ApiResponse<void>>(`/api/v1/cliente/${clienteId}`)
      .pipe(map((response: ApiResponse<void>) => normalizeResponseData(response)));
  }
}
