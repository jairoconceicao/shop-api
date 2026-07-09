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

    expect(alert).toHaveClass('bg-rose-50');
    expect(screen.getByText('Atenção')).toBeVisible();
    expect(screen.getByText('Não foi possível salvar sua alteração.')).toBeVisible();
  });
});
