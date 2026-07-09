import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';

import { SkeletonStateComponent } from './skeleton-state.component';

describe('SkeletonStateComponent', () => {
  it('renders the requested amount of skeleton lines', async () => {
    const { container } = await render(
      `
        <app-skeleton-state eyebrow="Buscando resultados" [count]="4" />
      `,
      {
        imports: [SkeletonStateComponent],
      },
    );

    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Buscando resultados')).toBeVisible();
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(7);
  });
});
