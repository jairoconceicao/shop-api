import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '@core/auth/auth.service';
import { TokenStorageService } from '@core/auth/token-storage.service';
import type { AuthSession } from '@shared/models';
import { resetStoreTestBed } from '../testing/store-test.context';

import { AuthStore } from './auth.store';

describe('AuthStore', () => {
  const authServiceMock = {
    login: vi.fn(),
    logout: vi.fn(),
  };

  const tokenStorageMock = {
    getSession: vi.fn(),
  };

  const session = (overrides: Partial<AuthSession> = {}): AuthSession => ({
    token: 'jwt-token',
    tipo: 'Bearer',
    expiraEm: '2026-07-11T12:00:00-03:00',
    usuarioId: 7,
    clienteId: 42,
    email: 'cliente@shop.com',
    ...overrides,
  });

  beforeEach(() => {
    authServiceMock.login.mockReset();
    authServiceMock.logout.mockReset();
    tokenStorageMock.getSession.mockReset();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        AuthStore,
        { provide: AuthService, useValue: authServiceMock },
        { provide: TokenStorageService, useValue: tokenStorageMock },
      ],
    });
  });

  afterEach(() => {
    resetStoreTestBed();
  });

  it('starts empty and exposes derived session signals', () => {
    const store = TestBed.inject(AuthStore);

    expect(store.isAuthenticated()).toBe(false);
    expect(store.session()).toBeNull();
    expect(store.token()).toBe('');
    expect(store.email()).toBe('');
    expect(store.customerId()).toBeNull();
    expect(store.userId()).toBeNull();
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('loads the persisted session from storage', () => {
    tokenStorageMock.getSession.mockReturnValue(session());

    const store = TestBed.inject(AuthStore);

    store.loadSession();

    expect(store.isAuthenticated()).toBe(true);
    expect(store.email()).toBe('cliente@shop.com');
    expect(store.customerId()).toBe(42);
  });

  it('loads an empty session when storage has nothing persisted', () => {
    tokenStorageMock.getSession.mockReturnValue(null);

    const store = TestBed.inject(AuthStore);

    store.loadSession();

    expect(store.isAuthenticated()).toBe(false);
    expect(store.session()).toBeNull();
    expect(store.error()).toBeNull();
  });

  it('logs in and stores the session in the state', () => {
    authServiceMock.login.mockReturnValue(of(session()));

    const store = TestBed.inject(AuthStore);

    store.login({ email: 'cliente@shop.com', senha: '123456' });

    expect(authServiceMock.login).toHaveBeenCalledWith({
      email: 'cliente@shop.com',
      senha: '123456',
    });
    expect(store.isAuthenticated()).toBe(true);
    expect(store.session()?.token).toBe('jwt-token');
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('sets an error state when login fails', () => {
    authServiceMock.login.mockReturnValue(throwError(() => new Error('fail')));

    const store = TestBed.inject(AuthStore);

    store.login({ email: 'cliente@shop.com', senha: '123456' });

    expect(store.isAuthenticated()).toBe(false);
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBe('Nao foi possivel autenticar o usuario.');
  });

  it('logs out and clears the session', () => {
    authServiceMock.logout.mockReturnValue(of(null));

    const store = TestBed.inject(AuthStore);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    store.setSession(session());
    store.logout();

    expect(authServiceMock.logout).toHaveBeenCalledTimes(1);
    expect(store.isAuthenticated()).toBe(false);
    expect(store.session()).toBeNull();
    expect(store.error()).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('reports an error when logout fails and still redirects to login', () => {
    authServiceMock.logout.mockReturnValue(throwError(() => new Error('fail')));

    const store = TestBed.inject(AuthStore);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    store.setSession(session());
    store.logout();

    expect(authServiceMock.logout).toHaveBeenCalledTimes(1);
    expect(store.isAuthenticated()).toBe(false);
    expect(store.session()).toBeNull();
    expect(store.error()).toBe('Nao foi possivel encerrar a sessao.');
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('can clear the session state independently', () => {
    const store = TestBed.inject(AuthStore);

    store.setSession(session());
    store.clearSession();

    expect(store.isAuthenticated()).toBe(false);
    expect(store.session()).toBeNull();
    expect(store.token()).toBe('');
  });
});
