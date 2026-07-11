import { HttpErrorResponse, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { firstValueFrom, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { authInterceptor } from './auth.interceptor';
import { TokenStorageService } from './token-storage.service';

describe('authInterceptor', () => {
  const tokenStorageMock = {
    getToken: vi.fn(),
    clearSession: vi.fn(),
  };

  beforeEach(() => {
    tokenStorageMock.getToken.mockReset();
    tokenStorageMock.clearSession.mockReset();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
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
    const next = vi.fn((receivedRequest: HttpRequest<unknown>) =>
      of(new HttpResponse({ body: receivedRequest })),
    );

    const forwardedResponse = TestBed.runInInjectionContext(() => authInterceptor(request, next));

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.any(HttpHeaders),
      }),
    );
    return firstValueFrom(forwardedResponse).then((response) => {
      const forwardedRequest = (response as HttpResponse<HttpRequest<unknown>>).body;

      expect(forwardedRequest!.headers.get('Authorization')).toBe('Bearer jwt-token');
    });
  });

  it('forwards the request unchanged when no token exists', async () => {
    tokenStorageMock.getToken.mockReturnValue(null);
    const request = new HttpRequest('GET', '/api/v1/products');
    const next = vi.fn((receivedRequest: HttpRequest<unknown>) =>
      of(new HttpResponse({ body: receivedRequest })),
    );

    const forwardedResponse = TestBed.runInInjectionContext(() => authInterceptor(request, next));
    const response = await firstValueFrom(forwardedResponse);
    const forwardedRequest = (response as HttpResponse<HttpRequest<unknown>>).body;

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(request);
    expect(forwardedRequest).toBe(request);
  });

  it('does not overwrite an explicit authorization header', async () => {
    tokenStorageMock.getToken.mockReturnValue('jwt-token');
    const request = new HttpRequest('GET', '/api/v1/auth/logout', {
      headers: new HttpHeaders({
        Authorization: 'Bearer explicit-token',
      }),
    });
    const next = vi.fn((receivedRequest: HttpRequest<unknown>) =>
      of(new HttpResponse({ body: receivedRequest })),
    );

    const forwardedResponse = TestBed.runInInjectionContext(() => authInterceptor(request, next));
    const response = await firstValueFrom(forwardedResponse);
    const forwardedRequest = (response as HttpResponse<HttpRequest<unknown>>).body;

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(request);
    expect(forwardedRequest!.headers.get('Authorization')).toBe('Bearer explicit-token');
  });

  it('clears the session and redirects to login when the API responds with 401', async () => {
    tokenStorageMock.getToken.mockReturnValue('jwt-token');
    const request = new HttpRequest('GET', '/api/v1/orders');
    const next = vi.fn(() =>
      throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' })),
    );
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    await expect(firstValueFrom(TestBed.runInInjectionContext(() => authInterceptor(request, next)))).rejects.toMatchObject({ status: 401 });

    expect(tokenStorageMock.clearSession).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith([
      '/login',
      {
        queryParams: {
          returnUrl: router.url,
        },
      },
    ]);
  });
});
