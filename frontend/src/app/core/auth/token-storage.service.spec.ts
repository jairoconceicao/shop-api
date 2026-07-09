import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { TokenStorageService } from './token-storage.service';

describe('TokenStorageService', () => {
  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [TokenStorageService],
    });
  });

  it('stores, reads and clears the access token', () => {
    const service = TestBed.inject(TokenStorageService);

    service.setToken('  jwt-token  ');

    expect(service.getToken()).toBe('jwt-token');
    expect(service.hasToken()).toBe(true);

    service.clearToken();

    expect(service.getToken()).toBeNull();
    expect(service.hasToken()).toBe(false);
  });

  it('removes the stored token when set with an empty value', () => {
    const service = TestBed.inject(TokenStorageService);

    service.setToken('jwt-token');
    service.setToken('   ');

    expect(service.getToken()).toBeNull();
    expect(service.hasToken()).toBe(false);
  });

  it('is a no-op when browser storage is unavailable', () => {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        TokenStorageService,
        {
          provide: DOCUMENT,
          useValue: {
            defaultView: null,
          },
        },
      ],
    });

    const service = TestBed.inject(TokenStorageService);

    expect(() => service.setToken('jwt-token')).not.toThrow();
    expect(service.getToken()).toBeNull();
    expect(service.hasToken()).toBe(false);
    expect(() => service.clearToken()).not.toThrow();
  });
});
