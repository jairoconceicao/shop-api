import type { ApiPagination, ApiResponse, PagedResponse } from './api-response.model';

export function normalizeResponseData<T>(response: ApiResponse<T>): T {
  return response.data;
}

export function normalizePaginationData<T>(response: PagedResponse<T>): ApiPagination<T> {
  return response.pagination;
}
