import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
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
    expect(screen.getByLabelText('Nome completo')).toBeVisible();
    expect(screen.getByLabelText('CPF')).toBeVisible();
    expect(screen.getByLabelText('Data de nascimento')).toBeVisible();
    expect(screen.getByLabelText('E-mail')).toBeVisible();
    expect(screen.getByLabelText('Senha')).toBeVisible();
    expect(screen.getByLabelText('CEP')).toBeVisible();
    expect(screen.getByLabelText('Logradouro')).toBeVisible();
    expect(screen.getByLabelText('Numero')).toBeVisible();
    expect(screen.getByLabelText('Complemento')).toBeVisible();
    expect(screen.getByLabelText('Bairro')).toBeVisible();
    expect(screen.getByLabelText('Cidade')).toBeVisible();
    expect(screen.getByLabelText('UF')).toBeVisible();
    expect(screen.getByLabelText('DDD')).toBeVisible();
    expect(screen.getByLabelText('Telefone celular')).toBeVisible();
    expect(screen.getByRole('checkbox', { name: 'Este numero usa WhatsApp' })).toBeVisible();
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

  it('renders schema validation feedback when the form is submitted empty', async () => {
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

    expect(screen.getByText('Nome e obrigatorio.')).toBeVisible();
    expect(screen.getByText('CPF e obrigatorio.')).toBeVisible();
    expect(screen.getByText('Data de nascimento e obrigatoria.')).toBeVisible();
    expect(screen.getByText('Email e obrigatorio.')).toBeVisible();
    expect(screen.getByText('Senha e obrigatoria.')).toBeVisible();
    expect(screen.getByText('Logradouro e obrigatorio.')).toBeVisible();
    expect(screen.getByText('Numero e obrigatorio.')).toBeVisible();
    expect(screen.getByText('CEP e obrigatorio.')).toBeVisible();
    expect(screen.getByText('Bairro e obrigatorio.')).toBeVisible();
    expect(screen.getByText('Cidade e obrigatoria.')).toBeVisible();
    expect(screen.getByText('UF e obrigatoria.')).toBeVisible();
    expect(screen.getByText('DDD e obrigatorio.')).toBeVisible();
    expect(screen.getByText('Numero de celular e obrigatorio.')).toBeVisible();
  });

  it('submits a normalized customer creation payload to the API', async () => {
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
        uf: 'sp',
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
