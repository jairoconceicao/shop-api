import type { AuthSession } from '@shared/models';

export abstract class AuthSessionStorage {
  abstract getToken(): string | null;

  abstract setToken(token: string | null | undefined): void;

  abstract getSession(): AuthSession | null;

  abstract setSession(session: AuthSession | null | undefined): void;

  abstract clearToken(): void;

  abstract clearSession(): void;

  abstract hasToken(): boolean;
}
