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
    expect(button).toHaveClass('min-h-11');
  });

  it('applies block and disabled state styles and attributes', async () => {
    await render(
      `
        <app-button [block]="true" [disabled]="true">
          Comprar agora
        </app-button>
      `,
      {
        imports: [ButtonComponent],
      },
    );

    const button = screen.getByRole('button', { name: 'Comprar agora' });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveClass('w-full');
    expect(button).toHaveClass('min-h-11');
  });
});
