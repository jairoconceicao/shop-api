import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';

import { App } from './app';

describe('App', () => {
  it('renders the storefront shell', async () => {
    await render(App);

    expect(screen.getAllByText('Shop API')[0]).toBeVisible();
    expect(screen.getByRole('link', { name: 'Criar conta' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Entrar' })).toBeVisible();
  });
});
