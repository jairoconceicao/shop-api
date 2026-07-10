import { provideRouter } from '@angular/router';

import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';

import { PasswordPageComponent } from './password-page.component';

describe('PasswordPageComponent', () => {
  it('renders the protected account password route shell', async () => {
    await render(PasswordPageComponent, {
      providers: [provideRouter([])],
    });

    expect(screen.getByRole('heading', { name: 'Alterar senha' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Voltar para conta' })).toHaveAttribute('href', '/account');
    expect(screen.getByLabelText('Senha atual')).toBeVisible();
    expect(screen.getByLabelText('Nova senha')).toBeVisible();
    expect(screen.getByLabelText('Confirmacao da senha')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Salvar senha' })).toBeVisible();
  });
});
