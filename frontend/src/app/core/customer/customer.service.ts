import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ApiClientService, normalizeResponseData, type ApiResponse } from '@shared/api';
import type { CustomerCreateRequest, CustomerIdResponse } from '@shared/models';

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
}
