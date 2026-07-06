export type ApiEnvelope<T> = {
  status: boolean;
  message: string;
  data: T | null;
};

export type ApiErrorEnvelope = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type PagedEnvelope<T> = {
  status: boolean;
  message: string;
  pagination: {
    pages: number;
    size: number;
    count: number;
    currentPage: number;
    next: boolean;
    previous: boolean;
    results: T[];
  };
};
