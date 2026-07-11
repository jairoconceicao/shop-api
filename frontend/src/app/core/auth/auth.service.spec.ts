import { HttpHeaders } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiClientService, type ApiResponse } from '@shared/api';
import type { AuthLoginResponse, AuthLogoutResponse } from '@shared/models';

import { AuthService } from './auth.service';
import { TokenStorageService } from './token-storage.service';

describe('AuthService', () => {
  const apiClientMock = {
    post: vi.fn(),
  };

  const tokenStorageMock = {
    getToken: vi.fn(),
    setSession: vi.fn(),
    setToken: vi.fn(),
    clearToken: vi.fn(),
  };

  beforeEach(() => {
    apiClientMock.post.mockReset();
    tokenStorageMock.getToken.mockReset();
    tokenStorageMock.setSession.mockReset();
    tokenStorageMock.setToken.mockReset();
    tokenStorageMock.clearToken.mockReset();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        {
          provide: ApiClientService,
          useValue: apiClientMock,
        },
        {
          provide: TokenStorageService,
          useValue: tokenStorageMock,
        },
      ],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('logs in and stores the returned access token', () => {
    const response = {
      status: true,
      message: '',
      data: {
        token: 'jwt-token',
        tipo: 'Bearer',
        expiraEm: '2026-07-09T12:00:00Z',
        usuarioId: 10,
        clienteId: 20,
        email: 'cliente@shopapi.dev',
      },
    } satisfies ApiResponse<AuthLoginResponse>;

    apiClientMock.post.mockReturnValue(of(response));

    const service = TestBed.inject(AuthService);
    const receivedSessions: AuthLoginResponse[] = [];

    service.login({
      email: 'cliente@shopapi.dev',
      senha: '12345678',
    }).subscribe((session) => {
      receivedSessions.push(session);
    });

    expect(apiClientMock.post).toHaveBeenCalledWith(
      '/api/v1/auth/login',
      {
        email: 'cliente@shopapi.dev',
        senha: '12345678',
      },
    );
    expect(receivedSessions).toHaveLength(1);
    expect(receivedSessions[0]).toEqual(response.data);
    expect(tokenStorageMock.setSession).toHaveBeenCalledWith(response.data);
  });

  it('logs out through the API and clears the stored token', () => {
    const response = {
      status: true,
      message: '',
      data: {
        jti: 'a1b2c3d4e5f6',
        revogadaEm: '2026-07-09T12:00:00Z',
      },
    } satisfies ApiResponse<AuthLogoutResponse>;

    apiClientMock.post.mockReturnValue(of(response));
    tokenStorageMock.getToken.mockReturnValue('jwt-token');

    const service = TestBed.inject(AuthService);
    const receivedLogoutResponses: Array<AuthLogoutResponse | null> = [];

    service.logout().subscribe((logoutResponse) => {
      receivedLogoutResponses.push(logoutResponse);
    });

    expect(apiClientMock.post).toHaveBeenCalledWith(
      '/api/v1/auth/logout',
      undefined,
      expect.objectContaining({
        headers: expect.any(HttpHeaders),
      }),
    );

    const requestOptions = apiClientMock.post.mock.calls[0][2];

    expect(requestOptions.headers.get('Authorization')).toBe('Bearer jwt-token');
    expect(receivedLogoutResponses).toEqual([response.data]);
    expect(tokenStorageMock.clearToken).toHaveBeenCalledTimes(1);
  });

  it('clears local authentication state when no token is available for logout', () => {
    tokenStorageMock.getToken.mockReturnValue(null);

    const service = TestBed.inject(AuthService);
    const receivedLogoutResponses: Array<AuthLogoutResponse | null> = [];

    service.logout().subscribe((logoutResponse) => {
      receivedLogoutResponses.push(logoutResponse);
    });

    expect(apiClientMock.post).not.toHaveBeenCalled();
    expect(receivedLogoutResponses).toEqual([null]);
    expect(tokenStorageMock.clearToken).toHaveBeenCalledTimes(1);
  });
});

