import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

import { CartItemComponent } from './cart-item.component';

describe('CartItemComponent', () => {
  it('renders item details and emits quantity/remove actions', async () => {
    const user = userEvent.setup();
    const quantityChange = vi.fn();
    const remove = vi.fn();

    await render(CartItemComponent, {
      componentInputs: {
        item: {
          itemId: 9,
          produtoId: 101,
          quantidade: 2,
          valorUnitario: 199.9,
        },
      },
      componentOutputs: {
        quantityChange,
        remove,
      },
    });

    expect(screen.getByText('Produto #101')).toBeVisible();
    expect(screen.getByText('R$ 399,80')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Diminuir quantidade' }));
    await user.click(screen.getByRole('button', { name: 'Remover' }));

    expect(quantityChange).toHaveBeenCalledWith(1);
    expect(remove).toHaveBeenCalled();
  });
});
