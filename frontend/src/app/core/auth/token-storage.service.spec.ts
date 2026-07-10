import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthSession } from '@shared/models';

import { AuthSessionStorage } from './auth-session-storage';
import { TokenStorageService } from './token-storage.service';

describe('TokenStorageService', () => {
  const sessionStorageMock = {
    getToken: vi.fn(),
    setToken: vi.fn(),
    getSession: vi.fn(),
    setSession: vi.fn(),
    clearToken: vi.fn(),
    clearSession: vi.fn(),
    hasToken: vi.fn(),
  };

  beforeEach(() => {
    sessionStorageMock.getToken.mockReset();
    sessionStorageMock.setToken.mockReset();
    sessionStorageMock.getSession.mockReset();
    sessionStorageMock.setSession.mockReset();
    sessionStorageMock.clearToken.mockReset();
    sessionStorageMock.clearSession.mockReset();
    sessionStorageMock.hasToken.mockReset();

    TestBed.configureTestingModule({
      providers: [
        TokenStorageService,
        {
          provide: AuthSessionStorage,
          useValue: sessionStorageMock,
        },
      ],
    });
  });

  it('delegates token reads and writes to the session storage abstraction', () => {
    const session = {
      token: 'jwt-token',
      tipo: 'Bearer',
      expiraEm: '2026-07-09T12:00:00Z',
      usuarioId: 10,
      clienteId: 20,
      email: 'cliente@shopapi.dev',
    } satisfies AuthSession;

    sessionStorageMock.getToken.mockReturnValue('jwt-token');
    sessionStorageMock.getSession.mockReturnValue(session);
    sessionStorageMock.hasToken.mockReturnValue(true);

    const service = TestBed.inject(TokenStorageService);

    expect(service.getToken()).toBe('jwt-token');
    expect(service.getSession()).toEqual(session);
    expect(service.hasToken()).toBe(true);

    service.setToken('jwt-token');
    service.setSession(session);
    service.clearToken();
    service.clearSession();

    expect(sessionStorageMock.setToken).toHaveBeenCalledWith('jwt-token');
    expect(sessionStorageMock.setSession).toHaveBeenCalledWith(session);
    expect(sessionStorageMock.clearToken).toHaveBeenCalledTimes(1);
    expect(sessionStorageMock.clearSession).toHaveBeenCalledTimes(1);
  });
});
