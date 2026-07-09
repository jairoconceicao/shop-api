import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';

import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  it('renders the button with the requested variant and size', async () => {
    await render(
      `
        <app-button type="submit" variant="secondary" size="lg">
          Adicionar ao carrinho
        </app-button>
      `,
      {
        imports: [ButtonComponent],
      },
    );

    const button = screen.getByRole('button', { name: 'Adicionar ao carrinho' });

    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveClass('bg-shop-secondary');
    expect(button).toHaveClass('px-6');
  });
});
