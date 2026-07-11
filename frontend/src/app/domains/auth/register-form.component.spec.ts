import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NgxMaskDirective, provideEnvironmentNgxMask } from 'ngx-mask';

import { CustomerService } from '@core/customer/customer.service';
import type { CustomerIdResponse } from '@shared/models';
import { NormalizedApiError } from '@shared/api/api-error.model';

import { RegisterFormComponent } from './register-form.component';
import { createEmptyRegisterFormValue } from './register-form.context';

describe('RegisterFormComponent', () => {
  const customerServiceMock = {
    create: vi.fn(),
  };

  beforeEach(() => {
    customerServiceMock.create.mockReset();
    customerServiceMock.create.mockReturnValue(
      of({
        clienteId: 20,
      } satisfies CustomerIdResponse),
    );
  });

  it('renders the registration form groups', async () => {
    const { fixture } = await render(RegisterFormComponent, {
      providers: [
        provideRouter([]),
        provideEnvironmentNgxMask(),
        {
          provide: CustomerService,
          useValue: customerServiceMock,
        },
      ],
    });

    const maskDirectives = fixture.debugElement.queryAll(By.directive(NgxMaskDirective));

    expect(screen.getByRole('heading', { name: 'Dados pessoais, endereco e celular' })).toBeVisible();
    expect(screen.getByText('Dados pessoais', { selector: 'legend' })).toBeVisible();
    expect(screen.getByText('Endereco', { selector: 'legend' })).toBeVisible();
    expect(screen.getByText('Celular', { selector: 'legend' })).toBeVisible();
    expect(screen.getAllByPlaceholderText('Cliente Shop')[0]).toBeVisible();
    expect(screen.getAllByPlaceholderText('123.456.789-01')[0]).toBeVisible();
    expect(document.querySelector('input[type="date"]')).toBeVisible();
    expect(screen.getAllByPlaceholderText('cliente@shopapi.dev')[0]).toBeVisible();
    expect(screen.getAllByPlaceholderText('Crie uma senha')[0]).toBeVisible();
    expect(screen.getAllByPlaceholderText('01001-000')[0]).toBeVisible();
    expect(screen.getAllByPlaceholderText('Rua Exemplo')[0]).toBeVisible();
    expect(screen.getAllByPlaceholderText('123')[0]).toBeVisible();
    expect(screen.getAllByPlaceholderText('Apto 10')[0]).toBeVisible();
    expect(screen.getAllByPlaceholderText('Centro')[0]).toBeVisible();
    expect(screen.getAllByPlaceholderText('Sao Paulo')[0]).toBeVisible();
    expect(screen.getByRole('combobox')).toHaveClass('focus-visible:ring-2');
    expect(screen.getAllByPlaceholderText('11')[0]).toBeVisible();
    expect(screen.getAllByPlaceholderText('99999-9999')[0]).toBeVisible();
    expect(screen.getByRole('checkbox')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Criar conta' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Ja tenho conta' })).toHaveAttribute('href', '/login');

    expect(maskDirectives).toHaveLength(4);
    expect(maskDirectives.map((debugElement) => debugElement.injector.get(NgxMaskDirective).mask())).toEqual([
      '000.000.000-00',
      '00000-000',
      '00',
      '00000-0000',
    ]);
  });

  it('associates the state select with its validation message', async () => {
    await render(RegisterFormComponent, {
      providers: [
        provideRouter([]),
        provideEnvironmentNgxMask(),
        {
          provide: CustomerService,
          useValue: customerServiceMock,
        },
      ],
    });

    screen.getByRole('button', { name: 'Criar conta' }).click();

    const ufSelect = screen.getByRole('combobox');

    expect(ufSelect).toHaveAttribute('aria-describedby', 'register-uf-error');
    expect(screen.getByRole('alert')).toHaveAttribute('id', 'register-uf-error');
  });

  it('renders schema validation feedback when the form is submitted empty', async () => {
    const { fixture } = await render(RegisterFormComponent, {
      providers: [
        provideRouter([]),
        provideEnvironmentNgxMask(),
        {
          provide: CustomerService,
          useValue: customerServiceMock,
        },
      ],
    });

    fixture.componentInstance.handleSubmit(new Event('submit'));
    fixture.detectChanges();

    expect(screen.getAllByText('Nome e obrigatorio.')[0]).toBeVisible();
    expect(screen.getAllByText('CPF e obrigatorio.')[0]).toBeVisible();
    expect(screen.getAllByText('Data de nascimento e obrigatoria.')[0]).toBeVisible();
    expect(screen.getAllByText('Email e obrigatorio.')[0]).toBeVisible();
    expect(screen.getAllByText('Senha e obrigatoria.')[0]).toBeVisible();
    expect(screen.getAllByText('Logradouro e obrigatorio.')[0]).toBeVisible();
    expect(screen.getAllByText('Numero e obrigatorio.')[0]).toBeVisible();
    expect(screen.getAllByText('CEP e obrigatorio.')[0]).toBeVisible();
    expect(screen.getAllByText('Bairro e obrigatorio.')[0]).toBeVisible();
    expect(screen.getAllByText('Cidade e obrigatoria.')[0]).toBeVisible();
    expect(screen.getAllByText('UF e obrigatoria.')[0]).toBeVisible();
    expect(screen.getAllByText('DDD e obrigatorio.')[0]).toBeVisible();
    expect(screen.getAllByText('Numero de celular e obrigatorio.')[0]).toBeVisible();
  });

  it('submits a normalized customer creation payload to the API through user interactions', async () => {
    const { fixture } = await render(RegisterFormComponent, {
      providers: [
        provideRouter([]),
        provideEnvironmentNgxMask(),
        {
          provide: CustomerService,
          useValue: customerServiceMock,
        },
      ],
    });
    const router = fixture.debugElement.injector.get(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.componentInstance.form.set({
      nome: '  Cliente Shop  ',
      cpf: '123.456.789-01',
      dataNascimento: '1990-01-01',
      email: ' cliente@shopapi.dev ',
      senha: '12345678',
      endereco: {
        logradouro: '  Rua Central ',
        numero: ' 100 ',
        complemento: ' Apt 10 ',
        cep: '01001-000',
        bairro: ' Centro ',
        cidade: ' Sao Paulo ',
        uf: 'SP',
      },
      celular: {
        ddd: '(11)',
        numero: '99999-9999',
        whatsApp: true,
      },
    });

    fixture.componentInstance.handleSubmit(new Event('submit'));

    expect(customerServiceMock.create).toHaveBeenCalledWith({
      senha: '12345678',
      cpf: '12345678901',
      nome: 'Cliente Shop',
      dataNascimento: '1990-01-01',
      email: 'cliente@shopapi.dev',
      endereco: {
        logradouro: 'Rua Central',
        numero: '100',
        complemento: 'Apt 10',
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
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('renders API validation feedback when the backend rejects the registration', async () => {
    customerServiceMock.create.mockReturnValue(
      throwError(
        () =>
          new NormalizedApiError({
            status: 422,
            code: 'VALIDATION_ERROR',
            message: 'Dados invalidos para o cadastro do cliente.',
            details: [
              {
                code: 'CLIENTE_EMAIL_INVALIDO',
                message: 'Email ja cadastrado.',
                propertyName: 'Email',
              },
              {
                code: 'CLIENTE_CELULAR_NUMERO_INVALIDO',
                message: 'Numero de celular invalido.',
                propertyName: 'Celular.Numero',
              },
            ],
          }),
      ),
    );

    const { fixture } = await render(RegisterFormComponent, {
      providers: [
        provideRouter([]),
        provideEnvironmentNgxMask(),
        {
          provide: CustomerService,
          useValue: customerServiceMock,
        },
      ],
    });

    fixture.componentInstance.form.set({
      ...createEmptyRegisterFormValue(),
      nome: 'Cliente Shop',
      cpf: '123.456.789-01',
      dataNascimento: '1990-01-01',
      email: 'cliente@shopapi.dev',
      senha: '12345678',
      endereco: {
        logradouro: 'Rua Central',
        numero: '100',
        complemento: 'Apto 10',
        cep: '01001-000',
        bairro: 'Centro',
        cidade: 'Sao Paulo',
        uf: 'SP',
      },
      celular: {
        ddd: '11',
        numero: '99999-9999',
        whatsApp: true,
      },
    });

    screen.getByRole('button', { name: 'Criar conta' }).click();

    expect(await screen.findByText('Email ja cadastrado.')).toBeVisible();
    expect(await screen.findByText('Numero de celular invalido.')).toBeVisible();
    expect(screen.queryByText('Dados invalidos para o cadastro do cliente.')).not.toBeInTheDocument();
  });

  it('renders a conflict message and field feedback when the backend detects duplicated data', async () => {
    customerServiceMock.create.mockReturnValue(
      throwError(
        () =>
          new NormalizedApiError({
            status: 409,
            code: 'CONFLICT_ERROR',
            message: 'Ja existe um cadastro com estes dados.',
            details: {
              cpf: ['CPF ja cadastrado.'],
              email: ['E-mail ja cadastrado.'],
            },
          }),
      ),
    );

    const { fixture } = await render(RegisterFormComponent, {
      providers: [
        provideRouter([]),
        provideEnvironmentNgxMask(),
        {
          provide: CustomerService,
          useValue: customerServiceMock,
        },
      ],
    });

    fixture.componentInstance.form.set({
      ...createEmptyRegisterFormValue(),
      nome: 'Cliente Shop',
      cpf: '123.456.789-01',
      dataNascimento: '1990-01-01',
      email: 'cliente@shopapi.dev',
      senha: '12345678',
      endereco: {
        logradouro: 'Rua Central',
        numero: '100',
        complemento: 'Apto 10',
        cep: '01001-000',
        bairro: 'Centro',
        cidade: 'Sao Paulo',
        uf: 'SP',
      },
      celular: {
        ddd: '11',
        numero: '99999-9999',
        whatsApp: true,
      },
    });

    screen.getByRole('button', { name: 'Criar conta' }).click();

    expect(await screen.findByText('Ja existe um cadastro com estes dados.')).toBeVisible();
    expect(await screen.findByText('CPF ja cadastrado.')).toBeVisible();
    expect(await screen.findByText('E-mail ja cadastrado.')).toBeVisible();
  });
});
