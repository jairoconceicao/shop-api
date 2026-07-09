import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiClientService, normalizeApiUrl } from './api-client.service';
import { NormalizedApiError } from './api-error.model';

describe('normalizeApiUrl', () => {
  it('keeps absolute urls intact', () => {
    expect(normalizeApiUrl('https://api.example.com/products')).toBe('https://api.example.com/products');
  });

  it('prefixes relative urls with a slash', () => {
    expect(normalizeApiUrl('api/v1/products')).toBe('/api/v1/products');
  });

  it('rejects empty urls', () => {
    expect(() => normalizeApiUrl('   ')).toThrow('API request URL cannot be empty.');
  });
});

describe('ApiClientService', () => {
  const httpClientMock = {
    request: vi.fn(),
  };

  let service: ApiClientService;

  beforeEach(() => {
    httpClientMock.request.mockReturnValue(of({}));

    TestBed.configureTestingModule({
      providers: [
        ApiClientService,
        {
          provide: HttpClient,
          useValue: httpClientMock,
        },
      ],
    });

    service = TestBed.inject(ApiClientService);
  });

  afterEach(() => {
    httpClientMock.request.mockReset();
  });

  it('normalizes request options and forwards them to HttpClient', () => {
    service
      .get('/api/v1/produto', {
        headers: {
          Authorization: 'Bearer token',
          Accept: ['application/json', 'text/plain'],
        },
        params: {
          page: 2,
          searchword: 'notebook',
          featured: true,
          tags: ['gaming', 'work'],
          skip: null,
        },
      })
      .subscribe();

    expect(httpClientMock.request).toHaveBeenCalledWith(
      'GET',
      '/api/v1/produto',
      expect.objectContaining({
        body: undefined,
        headers: expect.any(HttpHeaders),
        params: expect.any(HttpParams),
        responseType: 'json',
      }),
    );

    const requestOptions = httpClientMock.request.mock.calls[0][2];

    expect(requestOptions.headers.get('Authorization')).toBe('Bearer token');
    expect(requestOptions.headers.getAll('Accept')).toEqual(['application/json', 'text/plain']);
    expect(requestOptions.params.toString()).toBe(
      'page=2&searchword=notebook&featured=true&tags=gaming&tags=work',
    );
  });

  it('supports request bodies for mutating calls', () => {
    service.post('/api/v1/carrinho/items', {
      produtoId: 1,
      quantidade: 2,
    }).subscribe();

    expect(httpClientMock.request).toHaveBeenCalledWith(
      'POST',
      '/api/v1/carrinho/items',
      expect.objectContaining({
        body: {
          produtoId: 1,
          quantidade: 2,
        },
        responseType: 'json',
      }),
    );
  });

  it('normalizes HttpErrorResponse failures before rethrowing them', () => {
    httpClientMock.request.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 422,
            statusText: 'Unprocessable Entity',
            error: {
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Email invalido.',
                details: {
                  email: ['Email invalido.'],
                },
              },
            },
          }),
      ),
    );

    const receivedErrors: unknown[] = [];

    service.get('/api/v1/cliente').subscribe({
      error: (error) => {
        receivedErrors.push(error);
      },
    });

    expect(receivedErrors).toHaveLength(1);
    expect(receivedErrors[0]).toBeInstanceOf(NormalizedApiError);

    const error = receivedErrors[0] as NormalizedApiError;

    expect(error.status).toBe(422);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.message).toBe('Email invalido.');
    expect(error.details).toEqual({
      email: ['Email invalido.'],
    });
  });
});
