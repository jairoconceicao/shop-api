import { vi } from 'vitest';

import type { CustomerDetails } from '@shared/models';

import type { ProfileFormValue } from './profile-form.schema';

export const customerAreaFixture: CustomerDetails = {
  clienteId: 42,
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
};

export const customerAreaProfileFormFixture: ProfileFormValue = {
  cpf: '123.456.789-01',
  nome: ' Cliente Shop ',
  dataNascimento: '1990-01-01',
  email: ' cliente@shop.com ',
  endereco: {
    logradouro: ' Rua Central ',
    numero: ' 100 ',
    complemento: ' Apto 12 ',
    cep: '01001-000',
    bairro: ' Centro ',
    cidade: ' Sao Paulo ',
    uf: 'sp',
  },
  celular: {
    ddd: '(11)',
    numero: '(11) 99999-9999',
    whatsApp: true,
  },
};

export function createCustomerStoreMock(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    loadProfile: vi.fn(),
    updateProfile: vi.fn(),
    deleteProfile: vi.fn(),
    isLoading: vi.fn(() => false),
    error: vi.fn(() => null),
    profile: vi.fn(() => customerAreaFixture),
    displayName: vi.fn(() => customerAreaFixture.nome),
    email: vi.fn(() => customerAreaFixture.email),
    cpf: vi.fn(() => customerAreaFixture.cpf),
    primaryPhone: vi.fn(() => `(${customerAreaFixture.celular.ddd}) ${customerAreaFixture.celular.numero}`),
    ...overrides,
  };
}
