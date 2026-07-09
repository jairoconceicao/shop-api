import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';

import { SuccessStateComponent } from './success-state.component';

describe('SuccessStateComponent', () => {
  it('renders a success message and projected actions', async () => {
    await render(
      `
        <app-success-state
          eyebrow="Pedido confirmado"
          title="Seu pedido foi criado"
          description="Você receberá um e-mail com os próximos passos."
        >
          <a href="/account/orders">Ver pedidos</a>
        </app-success-state>
      `,
      {
        imports: [SuccessStateComponent],
      },
    );

    expect(screen.getByRole('status')).toBeVisible();
    expect(screen.getByText('Pedido confirmado')).toBeVisible();
    expect(screen.getByText('Seu pedido foi criado')).toBeVisible();
    expect(screen.getByText('Ver pedidos')).toBeVisible();
  });
});
