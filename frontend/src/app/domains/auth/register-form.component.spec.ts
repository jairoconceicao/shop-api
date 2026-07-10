import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';
import { NgxMaskDirective, provideEnvironmentNgxMask } from 'ngx-mask';

import { RegisterFormComponent } from './register-form.component';

describe('RegisterFormComponent', () => {
  it('renders the registration form groups', async () => {
    const { fixture } = await render(RegisterFormComponent, {
      providers: [provideRouter([]), provideEnvironmentNgxMask()],
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
      providers: [provideRouter([]), provideEnvironmentNgxMask()],
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
});
