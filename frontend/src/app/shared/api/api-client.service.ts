import {
  HttpClient,
  HttpContext,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

import { normalizeApiError } from './api-error.normalizers';

export type ApiPrimitive = string | number | boolean;
export type ApiParamValue = ApiPrimitive | readonly ApiPrimitive[] | null | undefined;
export type ApiParams = Record<string, ApiParamValue>;
export type ApiHeaderValue = string | readonly string[];
export type ApiHeaders = Record<string, ApiHeaderValue>;

export interface ApiRequestOptions {
  context?: HttpContext;
  headers?: HttpHeaders | ApiHeaders;
  params?: HttpParams | ApiParams;
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ApiClientService {
  private readonly httpClient = inject(HttpClient);

  get<TResponse>(url: string, options: ApiRequestOptions = {}): Observable<TResponse> {
    return this.request<TResponse>('GET', url, undefined, options);
  }

  post<TResponse, TBody = unknown>(
    url: string,
    body: TBody,
    options: ApiRequestOptions = {},
  ): Observable<TResponse> {
    return this.request<TResponse, TBody>('POST', url, body, options);
  }

  put<TResponse, TBody = unknown>(
    url: string,
    body: TBody,
    options: ApiRequestOptions = {},
  ): Observable<TResponse> {
    return this.request<TResponse, TBody>('PUT', url, body, options);
  }

  patch<TResponse, TBody = unknown>(
    url: string,
    body: TBody,
    options: ApiRequestOptions = {},
  ): Observable<TResponse> {
    return this.request<TResponse, TBody>('PATCH', url, body, options);
  }

  delete<TResponse>(url: string, options: ApiRequestOptions = {}): Observable<TResponse> {
    return this.request<TResponse>('DELETE', url, undefined, options);
  }

  request<TResponse, TBody = unknown>(
    method: string,
    url: string,
    body: TBody | undefined = undefined,
    options: ApiRequestOptions = {},
  ): Observable<TResponse> {
    return this.httpClient.request<TResponse>(method.toUpperCase(), normalizeApiUrl(url), {
      body,
      context: options.context,
      headers: normalizeHeaders(options.headers),
      params: normalizeParams(options.params),
      reportProgress: options.reportProgress,
      responseType: 'json',
      withCredentials: options.withCredentials,
    }).pipe(catchError((error) => throwError(() => normalizeApiError(error))));
  }
}

export function normalizeApiUrl(url: string): string {
  const normalizedUrl = url.trim();

  if (!normalizedUrl) {
    throw new Error('API request URL cannot be empty.');
  }

  if (/^https?:\/\//i.test(normalizedUrl)) {
    return normalizedUrl;
  }

  return normalizedUrl.startsWith('/') ? normalizedUrl : `/${normalizedUrl}`;
}

function normalizeHeaders(headers?: HttpHeaders | ApiHeaders): HttpHeaders | undefined {
  if (!headers) {
    return undefined;
  }

  if (headers instanceof HttpHeaders) {
    return headers;
  }

  let normalizedHeaders = new HttpHeaders();

  for (const [name, value] of Object.entries(headers)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        normalizedHeaders = normalizedHeaders.append(name, item);
      }

      continue;
    }

    if (typeof value === 'string') {
      normalizedHeaders = normalizedHeaders.set(name, value);
      continue;
    }

    normalizedHeaders = normalizedHeaders.set(name, Array.from(value));
  }

  return normalizedHeaders;
}

function normalizeParams(params?: HttpParams | ApiParams): HttpParams | undefined {
  if (!params) {
    return undefined;
  }

  if (params instanceof HttpParams) {
    return params;
  }

  let normalizedParams = new HttpParams();

  for (const [name, value] of Object.entries(params)) {
    if (value === null || value === undefined) {
      continue;
    }

    const values = Array.isArray(value) ? value : [value];

    for (const item of values) {
      normalizedParams = normalizedParams.append(name, String(item));
    }
  }

  return normalizedParams;
}
