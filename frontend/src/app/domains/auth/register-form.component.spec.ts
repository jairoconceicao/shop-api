import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';

import { RegisterFormComponent } from './register-form.component';

describe('RegisterFormComponent', () => {
  it('renders the registration form groups', async () => {
    await render(RegisterFormComponent, {
      providers: [provideRouter([])],
    });

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
  });
});
