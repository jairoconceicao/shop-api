import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';

import { RegisterPageComponent } from './register-page.component';

describe('RegisterPageComponent', () => {
  it('renders the public account creation screen', async () => {
    await render(RegisterPageComponent, {
      providers: [provideRouter([])],
    });

    expect(screen.getByRole('heading', { name: 'Crie sua conta e comece a comprar.' })).toBeVisible();
    expect(screen.getByText('Cadastro publico')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Ja tenho conta' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: 'Explorar catalogo' })).toHaveAttribute('href', '/products');
    expect(screen.getByRole('link', { name: 'Voltar para login' })).toHaveAttribute('href', '/login');
  });
});
