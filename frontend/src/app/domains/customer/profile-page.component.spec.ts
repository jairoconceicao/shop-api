import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

import { CustomerStore } from './customer.store';
import { ProfilePageComponent } from './profile-page.component';

describe('ProfilePageComponent', () => {
  const createStoreMock = (overrides: Partial<Record<string, unknown>> = {}) => ({
    loadProfile: vi.fn(),
    displayName: vi.fn(() => 'Cliente Shop'),
    email: vi.fn(() => 'cliente@shop.com'),
    cpf: vi.fn(() => '12345678901'),
    primaryPhone: vi.fn(() => '(11) 999999999'),
    profile: vi.fn(() => ({
      endereco: {
        logradouro: 'Rua Central',
        numero: '100',
        complemento: 'Apto 12',
        cep: '01001000',
        bairro: 'Centro',
        cidade: 'Sao Paulo',
        uf: 'SP',
      },
      dataNascimento: '1990-01-01',
    })),
    ...overrides,
  });

  it('loads the authenticated customer profile when the page initializes', async () => {
    const customerStoreMock = createStoreMock();

    await render(ProfilePageComponent, {
      providers: [
        provideRouter([]),
        { provide: CustomerStore, useValue: customerStoreMock },
      ],
    });

    expect(customerStoreMock.loadProfile).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('heading', { name: 'Meus dados' })).toBeVisible();
    expect(screen.getByText('cliente@shop.com')).toBeVisible();
    expect(screen.getByText('12345678901')).toBeVisible();
    expect(screen.getByText('(11) 999999999')).toBeVisible();
    expect(screen.getByText('Rua Central, 100, Apto 12, Centro, Sao Paulo, SP')).toBeVisible();
    expect(screen.getByText('1990-01-01')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Voltar para conta' })).toHaveAttribute('href', '/account');
  });

  it('falls back to empty profile values when no customer is loaded', async () => {
    const customerStoreMock = createStoreMock({
      displayName: vi.fn(() => ''),
      email: vi.fn(() => ''),
      cpf: vi.fn(() => ''),
      primaryPhone: vi.fn(() => ''),
      profile: vi.fn(() => null),
    });

    await render(ProfilePageComponent, {
      providers: [
        provideRouter([]),
        { provide: CustomerStore, useValue: customerStoreMock },
      ],
    });

    expect(screen.getByText('Cliente')).toBeVisible();
    expect(screen.getByText('E-mail nao carregado')).toBeVisible();
    expect(screen.getAllByText('Nao informado')).toHaveLength(3);
  });
});
