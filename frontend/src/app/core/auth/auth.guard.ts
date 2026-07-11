import { inject } from '@angular/core';
import { Router, type ActivatedRouteSnapshot, type RouterStateSnapshot, type UrlTree } from '@angular/router';

import { authLoginPath, authRedirectQueryParam } from './auth-redirect.context';
import { TokenStorageService } from './token-storage.service';

export const authGuard = (
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): boolean | UrlTree => {
  const tokenStorage = inject(TokenStorageService);

  if (tokenStorage.hasToken()) {
    return true;
  }

  const router = inject(Router);
  const safeReturnUrl = normalizeReturnUrl(state.url);

  if (!safeReturnUrl) {
    return router.createUrlTree([authLoginPath]);
  }

  return router.createUrlTree([authLoginPath], {
    queryParams: { [authRedirectQueryParam]: safeReturnUrl },
  });
};

function normalizeReturnUrl(returnUrl?: string | null): string | null {
  if (!returnUrl) {
    return null;
  }

  const normalizedReturnUrl = returnUrl.trim();

  if (!normalizedReturnUrl || !normalizedReturnUrl.startsWith('/') || normalizedReturnUrl.startsWith('//')) {
    return null;
  }

  return normalizedReturnUrl;
}
