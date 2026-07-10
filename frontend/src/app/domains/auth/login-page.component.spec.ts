import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
});
