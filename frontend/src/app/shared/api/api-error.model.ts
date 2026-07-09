export type ApiErrorDetails = Record<string, unknown>;

export interface ApiError {
  code: string;
  message: string;
  details: ApiErrorDetails | readonly unknown[] | string | null;
}

export interface ApiErrorResponse {
  error: ApiError;
}

export interface NormalizedApiErrorOptions {
  status: number;
  code: string;
  message: string;
  details: ApiErrorDetails | readonly unknown[] | string | null;
  response?: ApiErrorResponse;
}

export class NormalizedApiError extends Error {
  readonly status: number;

  readonly code: string;

  readonly details: ApiErrorDetails | readonly unknown[] | string | null;

  readonly response?: ApiErrorResponse;

  constructor(options: NormalizedApiErrorOptions) {
    super(options.message);
    this.name = 'NormalizedApiError';
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
    this.response = options.response;
  }
}
