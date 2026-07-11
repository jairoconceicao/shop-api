import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';
import { provideEnvironmentNgxMask } from 'ngx-mask';

import { RegisterPageComponent } from './register-page.component';

describe('RegisterPageComponent', () => {
  it('renders the public account creation screen', async () => {
    await render(RegisterPageComponent, {
      providers: [provideRouter([]), provideEnvironmentNgxMask()],
    });

    expect(screen.getByRole('heading', { name: 'Crie sua conta e comece a comprar.' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Dados pessoais, endereco e celular' })).toBeVisible();
    expect(screen.getAllByText('Cadastro publico')[0]).toBeVisible();
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
    expect(screen.getByRole('combobox')).toBeVisible();
    expect(screen.getAllByPlaceholderText('11')[0]).toBeVisible();
    expect(screen.getAllByPlaceholderText('99999-9999')[0]).toBeVisible();
    expect(screen.getByRole('checkbox')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Criar conta' })).toBeVisible();
    expect(screen.getAllByRole('link', { name: 'Ja tenho conta' })[0]).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: 'Explorar catalogo' })).toHaveAttribute('href', '/products');
  });
});
