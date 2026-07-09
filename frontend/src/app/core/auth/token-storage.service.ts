import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenStorageService {
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = 'shop-api.auth.token';

  getToken(): string | null {
    return this.getStorage()?.getItem(this.storageKey) ?? null;
  }

  setToken(token: string | null | undefined): void {
    const normalizedToken = token?.trim();

    if (!normalizedToken) {
      this.clearToken();
      return;
    }

    this.getStorage()?.setItem(this.storageKey, normalizedToken);
  }

  clearToken(): void {
    this.getStorage()?.removeItem(this.storageKey);
  }

  hasToken(): boolean {
    return this.getToken() !== null;
  }

  private getStorage(): Storage | null {
    return this.document.defaultView?.localStorage ?? null;
  }
}
