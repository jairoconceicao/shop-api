export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

export interface ApiPagination<T> {
  pages: number;
  size: number;
  totalItems: number;
  data: T[];
}

export interface PagedResponse<T> {
  status: boolean;
  message: string;
  pagination: ApiPagination<T>;
}
