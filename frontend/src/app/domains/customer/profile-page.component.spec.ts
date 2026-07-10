import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';
import { fireEvent } from '@testing-library/dom';
import { vi } from 'vitest';

import { CustomerStore } from './customer.store';
import { ProfilePageComponent } from './profile-page.component';
import {
  createCustomerStoreMock,
  customerAreaFixture,
  customerAreaProfileFormFixture,
} from './customer-area.context';
import { normalizeProfileFormValue } from './profile-form.schema';

describe('ProfilePageComponent', () => {
  it('loads the authenticated customer profile and renders the editable form', async () => {
    const customerStoreMock = createCustomerStoreMock({
      profile: vi.fn(() => customerAreaFixture),
    });

    await render(ProfilePageComponent, {
      providers: [
        provideRouter([]),
        { provide: CustomerStore, useValue: customerStoreMock },
      ],
    });

    expect(customerStoreMock.loadProfile).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('heading', { name: 'Meus dados' })).toBeVisible();
    expect(screen.getByDisplayValue('Cliente Shop')).toBeVisible();
    expect(screen.getByDisplayValue('12345678901')).toBeVisible();
    expect(screen.getByDisplayValue('1990-01-01')).toBeVisible();
    expect(screen.getByDisplayValue('cliente@shop.com')).toBeVisible();
    expect(screen.getByDisplayValue('Rua Central')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Salvar alteracoes' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Voltar para conta' })).toHaveAttribute('href', '/account');
  });

  it('submits the customer update request using the store action', async () => {
    const customerStoreMock = createCustomerStoreMock({
      profile: vi.fn(() => customerAreaFixture),
      isLoading: vi.fn(() => true),
      error: vi.fn(() => 'Nao foi possivel atualizar os dados do cliente.'),
    });

    await render(ProfilePageComponent, {
      providers: [
        provideRouter([]),
        { provide: CustomerStore, useValue: customerStoreMock },
      ],
    });

    expect(screen.getByText('Nao foi possivel atualizar os dados do cliente.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Salvar alteracoes' })).toBeDisabled();
  });

  it('normalizes the form before updating the customer profile', async () => {
    const customerStoreMock = createCustomerStoreMock({
      profile: vi.fn(() => customerAreaFixture),
    });

    await render(ProfilePageComponent, {
      providers: [
        provideRouter([]),
        { provide: CustomerStore, useValue: customerStoreMock },
      ],
    });

    fireEvent.click(screen.getByRole('button', { name: 'Salvar alteracoes' }));

    expect(customerStoreMock.updateProfile).toHaveBeenCalledTimes(1);
    expect(customerStoreMock.updateProfile).toHaveBeenCalledWith(
      normalizeProfileFormValue(customerAreaProfileFormFixture),
    );
  });

  it('shows schema validation feedback before submitting invalid data', async () => {
    const customerStoreMock = createCustomerStoreMock({
      profile: vi.fn(() => null),
    });

    await render(ProfilePageComponent, {
      providers: [
        provideRouter([]),
        { provide: CustomerStore, useValue: customerStoreMock },
      ],
    });

    await screen.getByRole('button', { name: 'Salvar alteracoes' }).click();

    expect(screen.getByText('Informe o nome completo.')).toBeVisible();
    expect(screen.getByText('Informe o CPF.')).toBeVisible();
    expect(screen.getByText('Informe um e-mail valido.')).toBeVisible();
    expect(customerStoreMock.updateProfile).not.toHaveBeenCalled();
  });
});
