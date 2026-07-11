import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';
import { fireEvent } from '@testing-library/dom';
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
    expect(screen.getByLabelText(/^Senha atual/)).toBeVisible();
    expect(screen.getByLabelText(/^Nova senha/)).toBeVisible();
    expect(screen.getByLabelText(/^Confirmacao/)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Salvar senha' })).toBeVisible();
  });

  it('renders schema validation feedback on submit', async () => {
    const { fixture } = await render(PasswordPageComponent, {
      providers: [provideRouter([])],
    });

    fixture.componentInstance.handleSubmit(new Event('submit'));
    fixture.detectChanges();

    expect(screen.getAllByText('Informe sua senha atual.')[0]).toBeVisible();
    expect(screen.getAllByText('Informe a nova senha.')[0]).toBeVisible();
    expect(screen.getAllByText('Confirme a nova senha.')[0]).toBeVisible();
    expect(screen.queryByText('Verifique os dados informados')).not.toBeInTheDocument();
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

    const { fixture } = await render(PasswordPageComponent, {
      providers: [provideRouter([])],
    });

    fixture.componentInstance.setField('senhaAtual', '12345678');
    fixture.componentInstance.setField('senhaNova', '87654321');
    fixture.componentInstance.setField('confirmacaoSenha', '87654321');

    fixture.componentInstance.handleSubmit(new Event('submit'));
    fixture.detectChanges();

    expect(customerServiceMock.updatePassword).toHaveBeenCalledWith(20, {
      senhaAtual: '12345678',
      senhaNova: '87654321',
    });
    expect(await screen.findByText('Sua senha foi atualizada com sucesso. Use a nova senha no próximo acesso.')).toBeVisible();
    expect(screen.getByText('Sua senha foi alterada')).toBeVisible();
    expect(screen.getByLabelText(/^Senha atual/)).toHaveValue('');
    expect(screen.getByLabelText(/^Nova senha/)).toHaveValue('');
    expect(screen.getByLabelText(/^Confirmacao/)).toHaveValue('');
  });

  it('shows the current password error returned by the API', async () => {
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
      throwError(() => ({
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Senha atual invalida.',
        details: null,
      })),
    );

    const { fixture } = await render(PasswordPageComponent, {
      providers: [provideRouter([])],
    });

    fixture.componentInstance.setField('senhaAtual', '12345678');
    fixture.componentInstance.setField('senhaNova', '87654321');
    fixture.componentInstance.setField('confirmacaoSenha', '87654321');
    fixture.componentInstance.handleSubmit(new Event('submit'));
    fixture.detectChanges();

    expect(await screen.findByText('A senha atual informada esta incorreta. Verifique os dados e tente novamente.')).toBeVisible();
    expect(screen.getAllByText('A senha atual informada esta incorreta.')[0]).toBeVisible();
    expect(screen.queryByText('Sua senha foi alterada')).not.toBeInTheDocument();
  });

  it('shows validation errors returned by the API on the relevant fields', async () => {
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
      throwError(() => ({
        status: 422,
        code: 'VALIDATION_ERROR',
        message: 'Revise os campos informados.',
        details: {
          senhaAtual: ['Informe a senha atual correta.'],
          senhaNova: ['A nova senha deve conter ao menos 8 caracteres.'],
        },
      })),
    );

    const { fixture } = await render(PasswordPageComponent, {
      providers: [provideRouter([])],
    });

    fixture.componentInstance.setField('senhaAtual', '12345678');
    fixture.componentInstance.setField('senhaNova', '87654321');
    fixture.componentInstance.setField('confirmacaoSenha', '87654321');
    fixture.componentInstance.handleSubmit(new Event('submit'));
    fixture.detectChanges();

    expect(await screen.findByText('Revise os campos destacados e tente novamente.')).toBeVisible();
    expect(screen.getAllByText('Informe a senha atual correta.')[0]).toBeVisible();
    expect(screen.getAllByText('A nova senha deve conter ao menos 8 caracteres.')[0]).toBeVisible();
    expect(screen.queryByText('Sua senha foi alterada')).not.toBeInTheDocument();
  });
});
