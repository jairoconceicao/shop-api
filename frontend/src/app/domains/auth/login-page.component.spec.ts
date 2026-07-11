import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
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
    const { fixture } = await render(LoginPageComponent, {
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

    fixture.componentInstance.handleSubmit(new Event('submit'));
    fixture.detectChanges();

    expect(screen.getAllByText('Informe seu e-mail.')[0]).toBeVisible();
    expect(screen.getAllByText('Informe sua senha.')[0]).toBeVisible();
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

    const { fixture } = await render(LoginPageComponent, {
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

    const emailInput = document.querySelector<HTMLInputElement>('input[placeholder="cliente@shopapi.dev"]')!;
    const passwordInput = document.querySelector<HTMLInputElement>('input[placeholder="Sua senha"]')!;
    const rememberMeCheckbox = screen.getByRole('checkbox') as HTMLInputElement;

    emailInput.value = 'cliente@shopapi.dev';
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.value = '12345678';
    passwordInput.dispatchEvent(new Event('input'));
    rememberMeCheckbox.checked = true;
    rememberMeCheckbox.dispatchEvent(new Event('change'));

    fixture.componentInstance.handleSubmit(new Event('submit'));
    fixture.detectChanges();

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

    const { fixture } = await render(LoginPageComponent, {
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

    const emailInput = document.querySelector<HTMLInputElement>('input[placeholder="cliente@shopapi.dev"]')!;
    const passwordInput = document.querySelector<HTMLInputElement>('input[placeholder="Sua senha"]')!;

    emailInput.value = 'cliente@shopapi.dev';
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.value = '12345678';
    passwordInput.dispatchEvent(new Event('input'));

    fixture.componentInstance.handleSubmit(new Event('submit'));
    fixture.detectChanges();

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

    const renderResult = await render(LoginPageComponent, {
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

    const router = renderResult.fixture.debugElement.injector.get(Router);
    const navigateByUrlSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

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

    expect(navigateByUrlSpy).toHaveBeenCalledWith('/');
  });

  it('renders an error state when login fails', async () => {
    const loginRequest = new Subject<never>();

    authServiceMock.login.mockReturnValue(loginRequest.asObservable());

    const { fixture } = await render(LoginPageComponent, {
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

    const emailInput = document.querySelector<HTMLInputElement>('input[placeholder="cliente@shopapi.dev"]')!;
    const passwordInput = document.querySelector<HTMLInputElement>('input[placeholder="Sua senha"]')!;

    emailInput.value = 'cliente@shopapi.dev';
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.value = '12345678';
    passwordInput.dispatchEvent(new Event('input'));

    fixture.componentInstance.handleSubmit(new Event('submit'));
    fixture.detectChanges();
    loginRequest.error(
      {
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Credenciais invalidas.',
        details: null,
      } as NormalizedApiError,
    );
    fixture.detectChanges();

    expect(screen.getByRole('alert')).toHaveTextContent('Nao foi possivel entrar');
    expect(screen.getByText('E-mail ou senha invalidos. Verifique seus dados e tente novamente.')).toBeVisible();
  });
});
