import { TestBed } from '@angular/core/testing';

import type { CustomerDetails } from '@shared/models';

import { CustomerStore } from './customer.store';

describe('CustomerStore', () => {
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
});
