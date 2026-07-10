import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { authInterceptor } from './core/auth/auth.interceptor';
import { AuthSessionStorage } from './core/auth/auth-session-storage';
import { LocalStorageAuthSessionStorageService } from './core/auth/local-storage-auth-session-storage.service';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    {
      provide: AuthSessionStorage,
      useClass: LocalStorageAuthSessionStorageService,
    },
    provideRouter(routes),
  ],
};
