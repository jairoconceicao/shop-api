import { type ActivatedRoute, Router } from '@angular/router';

export const authLoginPath = '/login';
export const authRedirectQueryParam = 'returnUrl';

export function createAuthLoginRedirectCommands(returnUrl?: string | null): Array<string | { queryParams: Record<string, string> }> {
  const safeReturnUrl = normalizeReturnUrl(returnUrl);

  if (!safeReturnUrl) {
    return [authLoginPath];
  }

  return [
    authLoginPath,
    {
      queryParams: {
        [authRedirectQueryParam]: safeReturnUrl,
      },
    },
  ];
}

export function resolveAuthLoginRedirectUrl(router: Router, activatedRoute: Pick<ActivatedRoute, 'snapshot'>): string {
  const requestedReturnUrl = activatedRoute.snapshot.queryParamMap.get(authRedirectQueryParam);
  const safeReturnUrl = normalizeReturnUrl(requestedReturnUrl);

  if (safeReturnUrl) {
    return safeReturnUrl;
  }

  const storedReturnUrl = router.url;
  const safeStoredReturnUrl = normalizeReturnUrl(storedReturnUrl);

  if (!safeStoredReturnUrl || safeStoredReturnUrl === authLoginPath) {
    return '/';
  }

  return safeStoredReturnUrl;
}

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
