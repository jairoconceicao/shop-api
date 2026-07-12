import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
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

    TestBed.configureTestingModule({
      imports: [LoginPageComponent],
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

    TestBed.overrideComponent(LoginPageComponent, {
      set: {
        schemas: [NO_ERRORS_SCHEMA],
      },
    });
  });

  it('renders validation feedback from the login schema', () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    fixture.detectChanges();

    fixture.componentInstance.handleSubmit(new Event('submit'));
    fixture.detectChanges();

    const errorElements = fixture.debugElement.queryAll(By.css('[role="alert"]'));
    expect(errorElements.length).toBeGreaterThan(0);

    const textContent = fixture.nativeElement.textContent;
    expect(textContent).toContain('Informe seu e-mail.');
    expect(textContent).toContain('Informe sua senha.');
    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it('submits normalized credentials when the schema is valid', () => {
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

    const fixture = TestBed.createComponent(LoginPageComponent);
    fixture.detectChanges();

    const inputs = fixture.debugElement.queryAll(By.css('input'));
    const emailInput = inputs.find((input) => input.nativeElement.placeholder === 'cliente@shopapi.dev');
    const passwordInput = inputs.find((input) => input.nativeElement.placeholder === 'Sua senha');

    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();

    emailInput!.nativeElement.value = '  cliente@shopapi.dev  ';
    emailInput!.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    passwordInput!.nativeElement.value = '12345678';
    passwordInput!.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
    expect(submitButton).toBeTruthy();
    submitButton.nativeElement.click();
    fixture.detectChanges();

    expect(authServiceMock.login).toHaveBeenCalledWith({
      email: 'cliente@shopapi.dev',
      senha: '12345678',
      lembrarMe: false,
    });
  });

  it('submits the remember-me flag when the checkbox is enabled', () => {
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

    const fixture = TestBed.createComponent(LoginPageComponent);
    fixture.detectChanges();

    const inputs = fixture.debugElement.queryAll(By.css('input'));
    const emailInput = inputs.find((input) => input.nativeElement.placeholder === 'cliente@shopapi.dev');
    const passwordInput = inputs.find((input) => input.nativeElement.placeholder === 'Sua senha');
    const checkbox = fixture.debugElement.query(By.css('input[type="checkbox"]'));

    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
    expect(checkbox).toBeTruthy();

    emailInput!.nativeElement.value = 'cliente@shopapi.dev';
    emailInput!.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    passwordInput!.nativeElement.value = '12345678';
    passwordInput!.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    checkbox!.nativeElement.checked = true;
    checkbox!.nativeElement.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    fixture.componentInstance.handleSubmit(new Event('submit'));
    fixture.detectChanges();

    expect(authServiceMock.login).toHaveBeenCalledWith({
      email: 'cliente@shopapi.dev',
      senha: '12345678',
      lembrarMe: true,
    });
  });

  it('shows the loading state while the login request is pending', () => {
    const loginRequest = new Subject<{
      token: string;
      tipo: string;
      expiraEm: string;
      usuarioId: number;
      clienteId: number;
      email: string;
    }>();

    authServiceMock.login.mockReturnValue(loginRequest.asObservable());

    const fixture = TestBed.createComponent(LoginPageComponent);
    fixture.detectChanges();

    const inputs = fixture.debugElement.queryAll(By.css('input'));
    const emailInput = inputs.find((input) => input.nativeElement.placeholder === 'cliente@shopapi.dev');
    const passwordInput = inputs.find((input) => input.nativeElement.placeholder === 'Sua senha');

    emailInput!.nativeElement.value = 'cliente@shopapi.dev';
    emailInput!.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    passwordInput!.nativeElement.value = '12345678';
    passwordInput!.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    fixture.componentInstance.handleSubmit(new Event('submit'));
    fixture.detectChanges();

    const statusElement = fixture.debugElement.query(By.css('[role="status"]'));
    expect(statusElement).toBeTruthy();
    expect(statusElement.nativeElement.textContent).toContain('Entrando na sua conta');

    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
    expect(submitButton.nativeElement.disabled).toBe(true);
    expect(submitButton.nativeElement.textContent).toContain('Entrando...');
  });

  it('renders a success state after a successful login', () => {
    const loginRequest = new Subject<{
      token: string;
      tipo: string;
      expiraEm: string;
      usuarioId: number;
      clienteId: number;
      email: string;
    }>();

    authServiceMock.login.mockReturnValue(loginRequest.asObservable());

    const fixture = TestBed.createComponent(LoginPageComponent);
    const router = TestBed.inject(Router);
    const navigateByUrlSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    fixture.detectChanges();

    const inputs = fixture.debugElement.queryAll(By.css('input'));
    const emailInput = inputs.find((input) => input.nativeElement.placeholder === 'cliente@shopapi.dev');
    const passwordInput = inputs.find((input) => input.nativeElement.placeholder === 'Sua senha');

    emailInput!.nativeElement.value = 'cliente@shopapi.dev';
    emailInput!.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    passwordInput!.nativeElement.value = '12345678';
    passwordInput!.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
    submitButton.nativeElement.click();
    fixture.detectChanges();

    loginRequest.next({
      token: 'jwt-token',
      tipo: 'Bearer',
      expiraEm: '2026-07-09T12:00:00Z',
      usuarioId: 10,
      clienteId: 20,
      email: 'cliente@shopapi.dev',
    });
    loginRequest.complete();
    fixture.detectChanges();

    expect(navigateByUrlSpy).toHaveBeenCalledWith('/');
  });

  it('renders an error state when login fails', () => {
    const loginRequest = new Subject<never>();

    authServiceMock.login.mockReturnValue(loginRequest.asObservable());

    const fixture = TestBed.createComponent(LoginPageComponent);
    fixture.detectChanges();

    const inputs = fixture.debugElement.queryAll(By.css('input'));
    const emailInput = inputs.find((input) => input.nativeElement.placeholder === 'cliente@shopapi.dev');
    const passwordInput = inputs.find((input) => input.nativeElement.placeholder === 'Sua senha');

    emailInput!.nativeElement.value = 'cliente@shopapi.dev';
    emailInput!.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    passwordInput!.nativeElement.value = '12345678';
    passwordInput!.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    fixture.componentInstance.handleSubmit(new Event('submit'));
    fixture.detectChanges();

    loginRequest.error({
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'Credenciais invalidas.',
      details: null,
    } as NormalizedApiError);
    fixture.detectChanges();

    const alertElement = fixture.debugElement.query(By.css('[role="alert"]'));
    expect(alertElement).toBeTruthy();
    expect(alertElement.nativeElement.textContent).toContain('Nao foi possivel entrar');
    expect(fixture.nativeElement.textContent).toContain(
      'E-mail ou senha invalidos. Verifique seus dados e tente novamente.',
    );
  });
});
