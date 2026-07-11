import { inject } from '@angular/core';
import { Router, type ActivatedRouteSnapshot, type RouterStateSnapshot, type UrlTree } from '@angular/router';

import { createAuthLoginRedirectCommands } from './auth-redirect.context';
import { TokenStorageService } from './token-storage.service';

export const authGuard = (
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): boolean | UrlTree => {
  const tokenStorage = inject(TokenStorageService);

  if (tokenStorage.hasToken()) {
    return true;
  }

  return inject(Router).createUrlTree(createAuthLoginRedirectCommands(state.url));
};
