import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import type { AuthSession } from '@shared/models';

import { LocalStorageAuthSessionStorageService } from './local-storage-auth-session-storage.service';

function createStorageMock(): Storage {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
}

describe('LocalStorageAuthSessionStorageService', () => {
  let storage: Storage;

  beforeEach(() => {
    storage = createStorageMock();

    TestBed.configureTestingModule({
      providers: [
        LocalStorageAuthSessionStorageService,
        {
          provide: DOCUMENT,
          useValue: {
            defaultView: { localStorage: storage },
          },
        },
      ],
    });
  });

  it('stores, reads and clears the session data', () => {
    const service = TestBed.inject(LocalStorageAuthSessionStorageService);
    const session = {
      token: 'jwt-token',
      tipo: 'Bearer',
      expiraEm: '2030-07-09T12:00:00Z',
      usuarioId: 10,
      clienteId: 20,
      email: 'cliente@shopapi.dev',
    } satisfies AuthSession;

    service.setSession(session);

    expect(service.getSession()).toEqual(session);
    expect(service.getToken()).toBe('jwt-token');
    expect(service.hasToken()).toBe(true);
    expect(storage.getItem('shop-api.auth.session')).toBe(JSON.stringify(session));
    expect(storage.getItem('shop-api.auth.token')).toBeNull();

    service.clearSession();

    expect(service.getSession()).toBeNull();
    expect(service.getToken()).toBeNull();
    expect(service.hasToken()).toBe(false);
  });

  it('keeps compatibility with the legacy token storage key', () => {
    const service = TestBed.inject(LocalStorageAuthSessionStorageService);

    service.setToken('jwt-token');

    expect(service.getToken()).toBe('jwt-token');
    expect(storage.getItem('shop-api.auth.token')).toBe('jwt-token');

    service.clearToken();

    expect(service.getToken()).toBeNull();
    expect(service.hasToken()).toBe(false);
    expect(storage.getItem('shop-api.auth.token')).toBeNull();
    expect(storage.getItem('shop-api.auth.session')).toBeNull();
  });

  it('updates the persisted session token when a session already exists', () => {
    const service = TestBed.inject(LocalStorageAuthSessionStorageService);
    const session = {
      token: 'old-token',
      tipo: 'Bearer',
      expiraEm: '2030-07-09T12:00:00Z',
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
    expect(storage.getItem('shop-api.auth.session')).toBe(
      JSON.stringify({
        ...session,
        token: 'new-token',
      }),
    );
    expect(storage.getItem('shop-api.auth.token')).toBeNull();
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

    storage.setItem('shop-api.auth.session', JSON.stringify(expiredSession));

    expect(service.getSession()).toBeNull();
    expect(service.getToken()).toBeNull();
    expect(service.hasToken()).toBe(false);
    expect(storage.getItem('shop-api.auth.session')).toBeNull();
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
