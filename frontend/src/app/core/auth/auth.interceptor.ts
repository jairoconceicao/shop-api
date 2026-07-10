import {
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';

import { TokenStorageService } from './token-storage.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (request.headers.has('Authorization')) {
    return next(request);
  }

  const token = inject(TokenStorageService).getToken();

  if (!token) {
    return next(request);
  }

  const authenticatedRequest = request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authenticatedRequest);
};
