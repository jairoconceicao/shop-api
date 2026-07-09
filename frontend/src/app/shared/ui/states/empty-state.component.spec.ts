import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';

import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  it('renders a descriptive empty state with optional action content', async () => {
    await render(
      `
        <app-empty-state
          eyebrow="Sem produtos"
          title="Sua busca não retornou resultados"
          description="Tente revisar os filtros ou buscar por outro termo."
        >
          <a href="/products">Ver todos os produtos</a>
        </app-empty-state>
      `,
      {
        imports: [EmptyStateComponent],
      },
    );

    expect(screen.getByRole('status')).toBeVisible();
    expect(screen.getByText('Sem produtos')).toBeVisible();
    expect(screen.getByText('Sua busca não retornou resultados')).toBeVisible();
    expect(screen.getByText('Ver todos os produtos')).toBeVisible();
  });
});
