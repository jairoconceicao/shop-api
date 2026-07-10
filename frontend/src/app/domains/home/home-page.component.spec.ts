import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';

import { HomePageComponent } from './home-page.component';

describe('HomePageComponent', () => {
  it('renders the mobile first storefront sections', async () => {
    await render(HomePageComponent, {
      providers: [provideRouter([])],
    });

    expect(screen.getByRole('heading', { name: /Sua vitrine mobile first/i })).toBeVisible();
    expect(screen.getByText('Ofertas da semana')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Explorar vitrine' })).toHaveAttribute(
      'href',
      '/products',
    );
    expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('heading', { name: 'Celulares e acessórios' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Notebook Slim 15' })).toBeVisible();
    expect(screen.getAllByRole('link', { name: 'Comprar' })).toHaveLength(4);
    expect(screen.getByText('Produtos em destaque')).toBeVisible();
  });
});
