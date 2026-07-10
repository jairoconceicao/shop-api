import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import type { AuthSession } from '@shared/models';

import { LocalStorageAuthSessionStorageService } from './local-storage-auth-session-storage.service';

describe('LocalStorageAuthSessionStorageService', () => {
  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [LocalStorageAuthSessionStorageService],
    });
  });

  it('stores, reads and clears the session data', () => {
    const service = TestBed.inject(LocalStorageAuthSessionStorageService);
    const session = {
      token: 'jwt-token',
      tipo: 'Bearer',
      expiraEm: '2026-07-09T12:00:00Z',
      usuarioId: 10,
      clienteId: 20,
      email: 'cliente@shopapi.dev',
    } satisfies AuthSession;

    service.setSession(session);

    expect(service.getSession()).toEqual(session);
    expect(service.getToken()).toBe('jwt-token');
    expect(service.hasToken()).toBe(true);
    expect(localStorage.getItem('shop-api.auth.session')).toBe(JSON.stringify(session));
    expect(localStorage.getItem('shop-api.auth.token')).toBeNull();

    service.clearSession();

    expect(service.getSession()).toBeNull();
    expect(service.getToken()).toBeNull();
    expect(service.hasToken()).toBe(false);
  });

  it('keeps compatibility with the legacy token storage key', () => {
    const service = TestBed.inject(LocalStorageAuthSessionStorageService);

    service.setToken('jwt-token');

    expect(service.getToken()).toBe('jwt-token');
    expect(localStorage.getItem('shop-api.auth.token')).toBe('jwt-token');

    service.clearToken();

    expect(service.getToken()).toBeNull();
    expect(service.hasToken()).toBe(false);
    expect(localStorage.getItem('shop-api.auth.token')).toBeNull();
    expect(localStorage.getItem('shop-api.auth.session')).toBeNull();
  });

  it('updates the persisted session token when a session already exists', () => {
    const service = TestBed.inject(LocalStorageAuthSessionStorageService);
    const session = {
      token: 'old-token',
      tipo: 'Bearer',
      expiraEm: '2026-07-09T12:00:00Z',
      usuarioId: 10,
      clienteId: 20,
      email: 'cliente@shopapi.dev',
    } satisfies AuthSession;

    service.setSession(session);
    service.setToken('new-token');

    expect(service.getToken()).toBe('new-token');
    expect(service.getSession()).toEqual({
      ...session,
      token: 'new-token',
    });
    expect(localStorage.getItem('shop-api.auth.session')).toBe(
      JSON.stringify({
        ...session,
        token: 'new-token',
      }),
    );
    expect(localStorage.getItem('shop-api.auth.token')).toBeNull();
  });

  it('drops expired sessions before exposing them', () => {
    const service = TestBed.inject(LocalStorageAuthSessionStorageService);
    const expiredSession = {
      token: 'jwt-token',
      tipo: 'Bearer',
      expiraEm: '2020-07-09T12:00:00Z',
      usuarioId: 10,
      clienteId: 20,
      email: 'cliente@shopapi.dev',
    } satisfies AuthSession;

    localStorage.setItem('shop-api.auth.session', JSON.stringify(expiredSession));

    expect(service.getSession()).toBeNull();
    expect(service.getToken()).toBeNull();
    expect(service.hasToken()).toBe(false);
    expect(localStorage.getItem('shop-api.auth.session')).toBeNull();
  });

  it('is a no-op when browser storage is unavailable', () => {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        LocalStorageAuthSessionStorageService,
        {
          provide: DOCUMENT,
          useValue: {
            defaultView: null,
          },
        },
      ],
    });

    const service = TestBed.inject(LocalStorageAuthSessionStorageService);

    expect(() => service.setSession({
      token: 'jwt-token',
      tipo: 'Bearer',
      expiraEm: '2026-07-09T12:00:00Z',
      usuarioId: 10,
      clienteId: 20,
      email: 'cliente@shopapi.dev',
    })).not.toThrow();
    expect(service.getToken()).toBeNull();
    expect(service.getSession()).toBeNull();
    expect(service.hasToken()).toBe(false);
    expect(() => service.clearToken()).not.toThrow();
  });
});
