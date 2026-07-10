import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { render, screen } from '@testing-library/angular';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CustomerService } from '@core/customer/customer.service';
import { TokenStorageService } from '@core/auth/token-storage.service';
import type { AuthSession } from '@shared/models';

import { PasswordPageComponent } from './password-page.component';

describe('PasswordPageComponent', () => {
  const customerServiceMock = {
    updatePassword: vi.fn(),
  };

  const tokenStorageMock = {
    getSession: vi.fn(),
  };

  beforeEach(() => {
    customerServiceMock.updatePassword.mockReset();
    tokenStorageMock.getSession.mockReset();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: CustomerService,
          useValue: customerServiceMock,
        },
        {
          provide: TokenStorageService,
          useValue: tokenStorageMock,
        },
      ],
    });
  });

  it('renders the protected account password route shell', async () => {
    await render(PasswordPageComponent, {
      providers: [provideRouter([])],
    });

    expect(screen.getByRole('heading', { name: 'Alterar senha' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Voltar para conta' })).toHaveAttribute('href', '/account');
    expect(screen.getByLabelText('Senha atual')).toBeVisible();
    expect(screen.getByLabelText('Nova senha')).toBeVisible();
    expect(screen.getByLabelText('Confirmacao da senha')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Salvar senha' })).toBeVisible();
  });

  it('renders schema validation feedback on submit', async () => {
    await render(PasswordPageComponent, {
      providers: [provideRouter([])],
    });

    const submitButton = screen.getByRole('button', { name: 'Salvar senha' });
    submitButton.click();

    expect(screen.getByText('Informe sua senha atual.')).toBeVisible();
    expect(screen.getByText('Informe a nova senha.')).toBeVisible();
    expect(screen.getByText('Confirme a nova senha.')).toBeVisible();
  });

  it('submits password changes for the customer from the active session', async () => {
    const session = {
      token: 'jwt-token',
      tipo: 'Bearer',
      expiraEm: '2026-07-09T12:00:00Z',
      usuarioId: 10,
      clienteId: 20,
      email: 'cliente@shopapi.dev',
    } satisfies AuthSession;

    tokenStorageMock.getSession.mockReturnValue(session);
    customerServiceMock.updatePassword.mockReturnValue(
      of({
        clienteId: 20,
      }),
    );

    await render(PasswordPageComponent, {
      providers: [provideRouter([])],
    });

    const currentPassword = screen.getByLabelText('Senha atual') as HTMLInputElement;
    const newPassword = screen.getByLabelText('Nova senha') as HTMLInputElement;
    const confirmPassword = screen.getByLabelText('Confirmacao da senha') as HTMLInputElement;

    currentPassword.value = '12345678';
    currentPassword.dispatchEvent(new Event('input'));
    newPassword.value = '87654321';
    newPassword.dispatchEvent(new Event('input'));
    confirmPassword.value = '87654321';
    confirmPassword.dispatchEvent(new Event('input'));

    screen.getByRole('button', { name: 'Salvar senha' }).click();

    expect(customerServiceMock.updatePassword).toHaveBeenCalledWith(20, {
      senhaAtual: '12345678',
      senhaNova: '87654321',
    });
    expect(screen.getByLabelText('Senha atual')).toHaveValue('');
    expect(screen.getByLabelText('Nova senha')).toHaveValue('');
    expect(screen.getByLabelText('Confirmacao da senha')).toHaveValue('');
  });
});
