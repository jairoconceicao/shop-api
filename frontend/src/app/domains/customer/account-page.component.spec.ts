import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';
import { fireEvent } from '@testing-library/dom';
import { vi } from 'vitest';

import { CustomerStore } from './customer.store';
import { AccountPageComponent } from './account-page.component';

describe('AccountPageComponent', () => {
  it('renders the customer area navigation and summary', async () => {
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
        complemento: null,
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

    await render(AccountPageComponent, {
      providers: [provideRouter([]), CustomerStore],
    });

    expect(screen.getByRole('heading', { name: 'Minha conta, Cliente Shop' })).toBeVisible();
    expect(screen.getByText('cliente@shop.com')).toBeVisible();
    expect(screen.getByText('12345678901')).toBeVisible();
    expect(screen.getByText('(11) 999999999')).toBeVisible();
    expect(screen.getByRole('navigation', { name: 'Menu da area do cliente' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Meus dados' })).toHaveAttribute('href', '/account/profile');
    expect(screen.getByRole('link', { name: 'Alterar senha' })).toHaveAttribute('href', '/account/password');
    expect(screen.getByRole('link', { name: 'Meus pedidos' })).toHaveAttribute('href', '/account/orders');
    expect(screen.getByRole('button', { name: 'Cancelar conta' })).toBeVisible();
  });

  it('falls back to a generic title when the customer profile is missing', async () => {
    await render(AccountPageComponent, {
      providers: [provideRouter([]), CustomerStore],
    });

    expect(screen.getByRole('heading', { name: 'Minha conta' })).toBeVisible();
    expect(screen.getByText('Cliente')).toBeVisible();
    expect(screen.getByText('E-mail nao carregado')).toBeVisible();
    expect(screen.getAllByText('Nao informado')).toHaveLength(2);
  });

  it('shows an explicit confirmation before deleting the account', async () => {
    const customerStore = TestBed.inject(CustomerStore);
    const deleteProfileSpy = vi.spyOn(customerStore, 'deleteProfile');

    await render(AccountPageComponent, {
      providers: [provideRouter([]), CustomerStore],
    });

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar conta' }));

    expect(screen.getByRole('heading', { name: 'Confirmar cancelamento da conta' })).toBeVisible();
    expect(
      screen.getByText(
        'Esta ação vai remover permanentemente a conta do cliente. Confirme somente se desejar cancelar o cadastro e perder acesso aos dados vinculados.',
      ),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Sim, cancelar conta' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Manter minha conta' })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Manter minha conta' }));

    expect(screen.queryByRole('heading', { name: 'Confirmar cancelamento da conta' })).toBeNull();
    expect(deleteProfileSpy).not.toHaveBeenCalled();
  });
});
