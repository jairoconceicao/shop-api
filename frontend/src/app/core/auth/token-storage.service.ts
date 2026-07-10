import { inject, Injectable } from '@angular/core';

import type { AuthSession } from '@shared/models';

import { AuthSessionStorage } from './auth-session-storage';

@Injectable({
  providedIn: 'root',
})
export class TokenStorageService {
  private readonly sessionStorage = inject(AuthSessionStorage);

  getToken(): string | null {
    return this.sessionStorage.getToken();
  }

  setToken(token: string | null | undefined): void {
    this.sessionStorage.setToken(token);
  }

  getSession(): AuthSession | null {
    return this.sessionStorage.getSession();
  }

  setSession(session: AuthSession | null | undefined): void {
    this.sessionStorage.setSession(session);
  }

  clearToken(): void {
    this.sessionStorage.clearToken();
  }

  clearSession(): void {
    this.sessionStorage.clearSession();
  }

  hasToken(): boolean {
    return this.sessionStorage.hasToken();
  }
}
