import { HttpHeaders, HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { authInterceptor } from './auth.interceptor';
import { TokenStorageService } from './token-storage.service';

describe('authInterceptor', () => {
  const tokenStorageMock = {
    getToken: vi.fn(),
  };

  beforeEach(() => {
    tokenStorageMock.getToken.mockReset();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: TokenStorageService,
          useValue: tokenStorageMock,
        },
      ],
    });
  });

  it('adds the bearer token when a session token exists', () => {
    tokenStorageMock.getToken.mockReturnValue('jwt-token');
    const request = new HttpRequest('GET', '/api/v1/products');
    const next = vi.fn((receivedRequest: HttpRequest<unknown>) => receivedRequest);

    const forwardedRequest = TestBed.runInInjectionContext(() => authInterceptor(request, next));

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.any(HttpHeaders),
      }),
    );
    expect(forwardedRequest.headers.get('Authorization')).toBe('Bearer jwt-token');
    expect(request.headers.has('Authorization')).toBe(false);
  });

  it('forwards the request unchanged when no token exists', () => {
    tokenStorageMock.getToken.mockReturnValue(null);
    const request = new HttpRequest('GET', '/api/v1/products');
    const next = vi.fn((receivedRequest: HttpRequest<unknown>) => receivedRequest);

    const forwardedRequest = TestBed.runInInjectionContext(() => authInterceptor(request, next));

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(request);
    expect(forwardedRequest).toBe(request);
  });

  it('does not overwrite an explicit authorization header', () => {
    tokenStorageMock.getToken.mockReturnValue('jwt-token');
    const request = new HttpRequest('GET', '/api/v1/auth/logout', {
      headers: new HttpHeaders({
        Authorization: 'Bearer explicit-token',
      }),
    });
    const next = vi.fn((receivedRequest: HttpRequest<unknown>) => receivedRequest);

    const forwardedRequest = TestBed.runInInjectionContext(() => authInterceptor(request, next));

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(request);
    expect(forwardedRequest.headers.get('Authorization')).toBe('Bearer explicit-token');
  });
});
