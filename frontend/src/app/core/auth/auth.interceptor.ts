import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { TokenStorageService } from './token-storage.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);

  if (request.headers.has('Authorization')) {
    return next(request);
  }

  const token = tokenStorage.getToken();

  if (!token) {
    return next(request).pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 401 && !isAuthRequest(request.url)) {
          tokenStorage.clearSession();
          void router.navigate(['/login'], {
            queryParams: {
              returnUrl: router.url,
            },
          });
        }

        return throwError(() => error);
      }),
    );
  }

  const authenticatedRequest = request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authenticatedRequest).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && !isAuthRequest(request.url)) {
        tokenStorage.clearSession();
        void router.navigate(['/login'], {
          queryParams: {
            returnUrl: router.url,
          },
        });
      }

      return throwError(() => error);
    }),
  );
};

const isAuthRequest = (url: string): boolean => url.includes('/api/v1/auth/login') || url.includes('/api/v1/auth/logout');
