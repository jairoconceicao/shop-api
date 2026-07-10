import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';
import { Subject, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type NormalizedApiError } from '@shared/api';
import { AuthService } from '@core/auth/auth.service';

import { LoginPageComponent } from './login-page.component';

describe('LoginPageComponent', () => {
  const authServiceMock = {
    login: vi.fn(),
  };

  beforeEach(() => {
    authServiceMock.login.mockReset();
  });

  it('renders validation feedback from the login schema', async () => {
    await render(LoginPageComponent, {
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    });

    const submitButton = screen.getByRole('button', { name: 'Entrar' });

    submitButton.click();

    expect(screen.getByText('Informe seu e-mail.')).toBeVisible();
    expect(screen.getByText('Informe sua senha.')).toBeVisible();
    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it('submits normalized credentials when the schema is valid', async () => {
    authServiceMock.login.mockReturnValue(
      of({
        token: 'jwt-token',
        tipo: 'Bearer',
        expiraEm: '2026-07-09T12:00:00Z',
        usuarioId: 10,
        clienteId: 20,
        email: 'cliente@shopapi.dev',
      }),
    );

    await render(LoginPageComponent, {
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    });

    const emailInput = screen.getByLabelText('E-mail') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Senha') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: 'Entrar' });

    emailInput.value = '  cliente@shopapi.dev  ';
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.value = '12345678';
    passwordInput.dispatchEvent(new Event('input'));

    submitButton.click();

    expect(authServiceMock.login).toHaveBeenCalledWith({
      email: 'cliente@shopapi.dev',
      senha: '12345678',
      lembrarMe: false,
    });
  });

  it('submits the remember-me flag when the checkbox is enabled', async () => {
    authServiceMock.login.mockReturnValue(
      of({
        token: 'jwt-token',
        tipo: 'Bearer',
        expiraEm: '2026-07-09T12:00:00Z',
        usuarioId: 10,
        clienteId: 20,
        email: 'cliente@shopapi.dev',
      }),
    );

    await render(LoginPageComponent, {
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    });

    const emailInput = screen.getByLabelText('E-mail') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Senha') as HTMLInputElement;
    const rememberMeCheckbox = screen.getByRole('checkbox', { name: 'Manter-me conectado' }) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: 'Entrar' });

    emailInput.value = 'cliente@shopapi.dev';
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.value = '12345678';
    passwordInput.dispatchEvent(new Event('input'));
    rememberMeCheckbox.checked = true;
    rememberMeCheckbox.dispatchEvent(new Event('change'));

    submitButton.click();

    expect(authServiceMock.login).toHaveBeenCalledWith({
      email: 'cliente@shopapi.dev',
      senha: '12345678',
      lembrarMe: true,
    });
  });

  it('shows the loading state while the login request is pending', async () => {
    const loginRequest = new Subject<{
      token: string;
      tipo: string;
      expiraEm: string;
      usuarioId: number;
      clienteId: number;
      email: string;
    }>();

    authServiceMock.login.mockReturnValue(loginRequest.asObservable());

    await render(LoginPageComponent, {
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    });

    const emailInput = screen.getByLabelText('E-mail') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Senha') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: 'Entrar' });

    emailInput.value = 'cliente@shopapi.dev';
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.value = '12345678';
    passwordInput.dispatchEvent(new Event('input'));

    submitButton.click();

    expect(screen.getByRole('status')).toHaveTextContent('Entrando na sua conta');
    expect(screen.getByRole('button', { name: 'Entrando...' })).toBeDisabled();
  });

  it('renders a success state after a successful login', async () => {
    const loginRequest = new Subject<{
      token: string;
      tipo: string;
      expiraEm: string;
      usuarioId: number;
      clienteId: number;
      email: string;
    }>();

    authServiceMock.login.mockReturnValue(loginRequest.asObservable());

    await render(LoginPageComponent, {
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    });

    const emailInput = screen.getByLabelText('E-mail') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Senha') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: 'Entrar' });

    emailInput.value = 'cliente@shopapi.dev';
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.value = '12345678';
    passwordInput.dispatchEvent(new Event('input'));

    submitButton.click();
    loginRequest.next({
      token: 'jwt-token',
      tipo: 'Bearer',
      expiraEm: '2026-07-09T12:00:00Z',
      usuarioId: 10,
      clienteId: 20,
      email: 'cliente@shopapi.dev',
    });
    loginRequest.complete();

    expect(screen.getByRole('status')).toHaveTextContent('Sessao iniciada');
    expect(screen.getByText(/A conta cliente@shopapi\.dev foi autenticada com sucesso\./)).toBeVisible();
    expect(screen.getByRole('link', { name: 'Ir para home' })).toHaveAttribute('href', '/');
  });

  it('renders an error state when login fails', async () => {
    const loginRequest = new Subject<never>();

    authServiceMock.login.mockReturnValue(loginRequest.asObservable());

    await render(LoginPageComponent, {
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    });

    const emailInput = screen.getByLabelText('E-mail') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Senha') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: 'Entrar' });

    emailInput.value = 'cliente@shopapi.dev';
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.value = '12345678';
    passwordInput.dispatchEvent(new Event('input'));

    submitButton.click();
    loginRequest.error(
      {
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Credenciais invalidas.',
        details: null,
      } as NormalizedApiError,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Nao foi possivel entrar');
    expect(screen.getByText('E-mail ou senha invalidos. Verifique seus dados e tente novamente.')).toBeVisible();
  });
});
