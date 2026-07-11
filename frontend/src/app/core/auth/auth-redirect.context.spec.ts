import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { describe, expect, it } from 'vitest';

import { authLoginPath, createAuthLoginRedirectCommands, resolveAuthLoginRedirectUrl } from './auth-redirect.context';

describe('auth-redirect.context', () => {
  it('builds login redirect commands with a safe return url', () => {
    expect(createAuthLoginRedirectCommands('/account/orders')).toEqual([
      authLoginPath,
      {
        queryParams: {
          returnUrl: '/account/orders',
        },
      },
    ]);
  });

  it('drops invalid return urls from redirect commands', () => {
    expect(createAuthLoginRedirectCommands('https://evil.example')).toEqual([authLoginPath]);
    expect(createAuthLoginRedirectCommands('//evil.example')).toEqual([authLoginPath]);
  });

  it('prefers the requested return url when resolving the login redirect target', () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });

    const router = TestBed.inject(Router);
    const target = resolveAuthLoginRedirectUrl(router, {
      snapshot: {
        queryParamMap: {
          get: (name: string) => (name === 'returnUrl' ? '/cart' : null),
        },
      },
    } as never);

    expect(target).toBe('/cart');
  });

  it('falls back to the current url when no requested return url exists', () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });

    const router = TestBed.inject(Router);
    expect(resolveAuthLoginRedirectUrl(router, { snapshot: { queryParamMap: new Map() as never } } as never)).toBe(
      '/',
    );
  });
});
