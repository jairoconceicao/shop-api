import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

import type { AuthSession } from '@shared/models';

@Injectable({
  providedIn: 'root',
})
export class TokenStorageService {
  private readonly document = inject(DOCUMENT);
  private readonly sessionStorageKey = 'shop-api.auth.session';
  private readonly legacyTokenStorageKey = 'shop-api.auth.token';

  getToken(): string | null {
    return this.getSession()?.token ?? this.getStorage()?.getItem(this.legacyTokenStorageKey) ?? null;
  }

  setToken(token: string | null | undefined): void {
    const normalizedToken = token?.trim();

    if (!normalizedToken) {
      this.clearToken();
      return;
    }

    const session = this.getSession();

    if (session) {
      this.setSession({
        ...session,
        token: normalizedToken,
      });
      return;
    }

    this.getStorage()?.setItem(this.legacyTokenStorageKey, normalizedToken);
  }

  getSession(): AuthSession | null {
    const serializedSession = this.getStorage()?.getItem(this.sessionStorageKey);

    if (!serializedSession) {
      return null;
    }

    try {
      const parsedSession: Partial<AuthSession> = JSON.parse(serializedSession) as Partial<AuthSession>;

      if (!this.isAuthSession(parsedSession)) {
        return null;
      }

      return parsedSession;
    } catch {
      return null;
    }
  }

  setSession(session: AuthSession | null | undefined): void {
    if (!this.isAuthSession(session)) {
      this.clearToken();
      return;
    }

    this.getStorage()?.setItem(this.sessionStorageKey, JSON.stringify(session));
    this.getStorage()?.removeItem(this.legacyTokenStorageKey);
  }

  clearToken(): void {
    const storage = this.getStorage();

    storage?.removeItem(this.sessionStorageKey);
    storage?.removeItem(this.legacyTokenStorageKey);
  }

  clearSession(): void {
    this.clearToken();
  }

  hasToken(): boolean {
    return this.getToken() !== null;
  }

  private getStorage(): Storage | null {
    return this.document.defaultView?.localStorage ?? null;
  }

  private isAuthSession(session: Partial<AuthSession> | null | undefined): session is AuthSession {
    return (
      !!session &&
      typeof session.token === 'string' &&
      session.token.trim().length > 0 &&
      typeof session.tipo === 'string' &&
      session.tipo.trim().length > 0 &&
      typeof session.expiraEm === 'string' &&
      typeof session.usuarioId === 'number' &&
      Number.isFinite(session.usuarioId) &&
      typeof session.clienteId === 'number' &&
      Number.isFinite(session.clienteId) &&
      typeof session.email === 'string' &&
      session.email.trim().length > 0
    );
  }
}
