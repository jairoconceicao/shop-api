import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CustomerService } from '@core/customer/customer.service';
import { TokenStorageService } from '@core/auth/token-storage.service';
import type { CustomerDetails } from '@shared/models';

import { CustomerStore } from './customer.store';

describe('CustomerStore', () => {
  const customerServiceMock = {
    getById: vi.fn(),
  };

  const tokenStorageMock = {
    getSession: vi.fn(),
  };

  const customer = (overrides: Partial<CustomerDetails> = {}): CustomerDetails => ({
    clienteId: 7,
    cpf: '12345678901',
    nome: 'Cliente Shop',
    dataNascimento: '1990-01-01',
    email: 'cliente@shop.com',
    endereco: {
      logradouro: 'Rua Central',
      numero: '100',
      complemento: 'Apto 12',
      cep: '01001000',
      bairro: 'Centro',
      cidade: 'Sao Paulo',
      uf: 'SP',
    },
    celular: {
      ddd: '11',
      numero: '999999999',
      whatsApp: true,
    },
    ...overrides,
  });

  beforeEach(() => {
    customerServiceMock.getById.mockReset();
    tokenStorageMock.getSession.mockReset();

    TestBed.configureTestingModule({
      providers: [
        CustomerStore,
        { provide: CustomerService, useValue: customerServiceMock },
        { provide: TokenStorageService, useValue: tokenStorageMock },
      ],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('starts without a profile and exposes empty derived state', () => {
    const store = TestBed.inject(CustomerStore);

    expect(store.hasProfile()).toBe(false);
    expect(store.displayName()).toBe('');
    expect(store.email()).toBe('');
    expect(store.customerId()).toBeNull();
    expect(store.cpf()).toBe('');
    expect(store.primaryPhone()).toBe('');
    expect(store.isReady()).toBe(false);
    expect(store.isEmpty()).toBe(true);
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('tracks loading and error states', () => {
    const store = TestBed.inject(CustomerStore);

    store.startLoading();

    expect(store.isLoading()).toBe(true);
    expect(store.isEmpty()).toBe(false);
    expect(store.error()).toBeNull();

    store.setError('Falha ao carregar cliente');

    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBe('Falha ao carregar cliente');
    expect(store.isReady()).toBe(false);
  });

  it('stores the customer profile and exposes derived data', () => {
    const store = TestBed.inject(CustomerStore);

    store.setProfile(customer());

    expect(store.hasProfile()).toBe(true);
    expect(store.displayName()).toBe('Cliente Shop');
    expect(store.email()).toBe('cliente@shop.com');
    expect(store.customerId()).toBe(7);
    expect(store.cpf()).toBe('12345678901');
    expect(store.primaryPhone()).toBe('(11) 999999999');
    expect(store.isReady()).toBe(true);
    expect(store.isEmpty()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('clears the customer profile and resets state', () => {
    const store = TestBed.inject(CustomerStore);

    store.setProfile(customer());
    store.clearProfile();

    expect(store.hasProfile()).toBe(false);
    expect(store.displayName()).toBe('');
    expect(store.email()).toBe('');
    expect(store.customerId()).toBeNull();
    expect(store.primaryPhone()).toBe('');
    expect(store.isReady()).toBe(false);
    expect(store.isEmpty()).toBe(true);
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('loads the customer profile from the authenticated session', () => {
    const profile = customer({ clienteId: 42, nome: 'Cliente Autenticado' });
    tokenStorageMock.getSession.mockReturnValue({ clienteId: 42 });
    customerServiceMock.getById.mockReturnValue(of(profile));

    const store = TestBed.inject(CustomerStore);

    store.loadProfile();

    expect(tokenStorageMock.getSession).toHaveBeenCalledTimes(1);
    expect(customerServiceMock.getById).toHaveBeenCalledWith(42);
    expect(store.profile()).toEqual(profile);
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('reports a session error when the customer id is missing', () => {
    tokenStorageMock.getSession.mockReturnValue(null);

    const store = TestBed.inject(CustomerStore);

    store.loadProfile();

    expect(customerServiceMock.getById).not.toHaveBeenCalled();
    expect(store.profile()).toBeNull();
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBe('Sessao do cliente indisponivel.');
  });
});
