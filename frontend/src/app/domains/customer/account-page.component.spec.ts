import { provideRouter } from '@angular/router';
import { render, screen, waitFor } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';
import { fireEvent } from '@testing-library/dom';
import { vi } from 'vitest';

import { CustomerStore } from './customer.store';
import { AccountPageComponent } from './account-page.component';
import { createCustomerStoreMock, customerAreaFixture } from './customer-area.context';

describe('AccountPageComponent', () => {
  it('renders the customer area navigation and summary', async () => {
    const customerStore = createCustomerStoreMock({
      profile: vi.fn(() => customerAreaFixture),
      displayName: vi.fn(() => customerAreaFixture.nome),
      email: vi.fn(() => customerAreaFixture.email),
      cpf: vi.fn(() => customerAreaFixture.cpf),
      primaryPhone: vi.fn(
        () => `(${customerAreaFixture.celular.ddd}) ${customerAreaFixture.celular.numero}`,
      ),
    });

    await render(AccountPageComponent, {
      providers: [provideRouter([]), { provide: CustomerStore, useValue: customerStore }],
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
    const customerStore = createCustomerStoreMock({
      profile: vi.fn(() => null),
      displayName: vi.fn(() => ''),
      email: vi.fn(() => ''),
      cpf: vi.fn(() => ''),
      primaryPhone: vi.fn(() => ''),
    });

    await render(AccountPageComponent, {
      providers: [provideRouter([]), { provide: CustomerStore, useValue: customerStore }],
    });

    expect(screen.getByRole('heading', { name: 'Minha conta' })).toBeVisible();
    expect(screen.getByText('Cliente')).toBeVisible();
    expect(screen.getByText('E-mail nao carregado')).toBeVisible();
    expect(screen.getAllByText('Nao informado')).toHaveLength(2);
  });

  it('shows an explicit confirmation before deleting the account', async () => {
    const customerStore = createCustomerStoreMock();

    await render(AccountPageComponent, {
      providers: [provideRouter([]), { provide: CustomerStore, useValue: customerStore }],
    });

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar conta' }));

    expect(await screen.findByRole('heading', { name: 'Confirmar cancelamento da conta' })).toBeVisible();
    expect(
      screen.getByText(
        'Esta ação vai remover permanentemente a conta do cliente. Confirme somente se desejar cancelar o cadastro e perder acesso aos dados vinculados.',
      ),
    ).toBeVisible();
    expect(await screen.findByRole('button', { name: 'Sim, cancelar conta' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Manter minha conta' })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Sim, cancelar conta' }));

    expect(customerStore.deleteProfile).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Confirmar cancelamento da conta' })).toBeNull(),
    );
  });
});
