import { HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { finalize, map, Observable, of, tap } from 'rxjs';

import { ApiClientService, normalizeResponseData, type ApiResponse } from '@shared/api';
import type {
  AuthLoginRequest,
  AuthLoginResponse,
  AuthLogoutResponse,
  AuthSession,
} from '@shared/models';

import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiClient = inject(ApiClientService);
  private readonly tokenStorage = inject(TokenStorageService);

  login(credentials: AuthLoginRequest): Observable<AuthSession> {
    return this.apiClient
      .post<ApiResponse<AuthLoginResponse>, AuthLoginRequest>('/api/v1/auth/login', credentials)
      .pipe(
        map((response: ApiResponse<AuthLoginResponse>) => normalizeResponseData(response)),
        tap((session) => {
          this.tokenStorage.setSession(session);
        }),
      );
  }

  logout(): Observable<AuthLogoutResponse | null> {
    const token = this.tokenStorage.getToken();

    if (!token) {
      this.tokenStorage.clearToken();
      return of(null);
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.apiClient
      .post<ApiResponse<AuthLogoutResponse>, void>(
        '/api/v1/auth/logout',
        undefined,
        { headers },
      )
      .pipe(
        map((response: ApiResponse<AuthLogoutResponse>) => normalizeResponseData(response)),
        finalize(() => {
          this.tokenStorage.clearToken();
        }),
      );
  }
}
