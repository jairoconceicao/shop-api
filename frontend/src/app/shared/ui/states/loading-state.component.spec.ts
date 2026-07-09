import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';

import { LoadingStateComponent } from './loading-state.component';

describe('LoadingStateComponent', () => {
  it('renders the loading state with accessible status text', async () => {
    await render(
      `
        <app-loading-state
          eyebrow="Processando"
          title="Carregando catálogo"
          description="Estamos preparando os produtos para exibição."
        />
      `,
      {
        imports: [LoadingStateComponent],
      },
    );

    const status = screen.getByRole('status');

    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Processando')).toBeVisible();
    expect(screen.getByText('Carregando catálogo')).toBeVisible();
    expect(screen.getByText('Estamos preparando os produtos para exibição.')).toBeVisible();
  });
});
