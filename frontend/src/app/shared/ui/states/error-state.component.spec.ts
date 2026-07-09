import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';

import { ErrorStateComponent } from './error-state.component';

describe('ErrorStateComponent', () => {
  it('renders the error details and projected recovery action', async () => {
    await render(
      `
        <app-error-state
          eyebrow="Falha na requisição"
          title="Não foi possível carregar os dados"
          description="Tente novamente em alguns instantes."
          details="Timeout ao acessar a API."
        >
          <button>Recarregar</button>
        </app-error-state>
      `,
      {
        imports: [ErrorStateComponent],
      },
    );

    expect(screen.getByRole('alert')).toBeVisible();
    expect(screen.getByText('Falha na requisição')).toBeVisible();
    expect(screen.getByText('Não foi possível carregar os dados')).toBeVisible();
    expect(screen.getByText('Timeout ao acessar a API.')).toBeVisible();
    expect(screen.getByText('Recarregar')).toBeVisible();
  });
});
