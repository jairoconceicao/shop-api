import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';

import { AlertComponent } from './alert.component';

describe('AlertComponent', () => {
  it('renders the alert content with the selected variant', async () => {
    await render(
      `
        <app-alert variant="danger" title="Atenção">
          Não foi possível salvar sua alteração.
        </app-alert>
      `,
      {
        imports: [AlertComponent],
      },
    );

    const alert = screen.getByRole('alert');

    expect(alert).toHaveClass('bg-shop-danger-soft');
    expect(screen.getByText('Atenção')).toBeVisible();
    expect(screen.getByText('Não foi possível salvar sua alteração.')).toBeVisible();
  });

  it('renders the default info variant without a title', async () => {
    await render(
      `
        <app-alert>
          Seu cadastro foi atualizado.
        </app-alert>
      `,
      {
        imports: [AlertComponent],
      },
    );

    const alert = screen.getByRole('alert');

    expect(alert).toHaveClass('bg-shop-primary-soft');
    expect(screen.getByText('Seu cadastro foi atualizado.')).toBeVisible();
    expect(screen.queryByText('Atenção')).not.toBeInTheDocument();
  });
});
