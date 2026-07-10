import { provideRouter, Router, type UrlTree } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { authGuard } from './auth.guard';
import { TokenStorageService } from './token-storage.service';

describe('authGuard', () => {
  const tokenStorageMock = {
    hasToken: vi.fn(),
  };

  beforeEach(() => {
    tokenStorageMock.hasToken.mockReset();

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

  it('allows access when a session token exists', () => {
    tokenStorageMock.hasToken.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/cart' } as never),
    );

    expect(result).toBe(true);
  });

  it('redirects anonymous users to login with the original url', () => {
    tokenStorageMock.hasToken.mockReturnValue(false);

    const router = TestBed.inject(Router);
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/account/orders' } as never),
    );

    expect(router.serializeUrl(result as UrlTree)).toBe(
      '/login?returnUrl=%2Faccount%2Forders',
    );
  });
});
