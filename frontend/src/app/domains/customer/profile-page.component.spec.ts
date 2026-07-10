import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';

import { CustomerStore } from './customer.store';
import { ProfilePageComponent } from './profile-page.component';

describe('ProfilePageComponent', () => {
  it('renders the customer profile summary', async () => {
    const customerStore = TestBed.inject(CustomerStore);
    customerStore.setProfile({
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
    });

    await render(ProfilePageComponent, {
      providers: [provideRouter([]), CustomerStore],
    });

    expect(screen.getByRole('heading', { name: 'Meus dados' })).toBeVisible();
    expect(screen.getByText('cliente@shop.com')).toBeVisible();
    expect(screen.getByText('12345678901')).toBeVisible();
    expect(screen.getByText('(11) 999999999')).toBeVisible();
    expect(screen.getByText('Rua Central, 100, Apto 12, Centro, Sao Paulo, SP')).toBeVisible();
    expect(screen.getByText('1990-01-01')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Voltar para conta' })).toHaveAttribute('href', '/account');
  });

  it('falls back to empty profile values when no customer is loaded', async () => {
    await render(ProfilePageComponent, {
      providers: [provideRouter([]), CustomerStore],
    });

    expect(screen.getByText('Cliente')).toBeVisible();
    expect(screen.getByText('E-mail nao carregado')).toBeVisible();
    expect(screen.getAllByText('Nao informado')).toHaveLength(3);
  });
});
