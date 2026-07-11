import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

import { CartItemComponent } from './cart-item.component';

describe('CartItemComponent', () => {
  it('renders item details and emits quantity/remove actions', async () => {
    const user = userEvent.setup();
    const quantityChanges: number[] = [];
    let removeCalled = false;

    const { fixture } = await render(CartItemComponent, {
      componentInputs: {
        item: {
          itemId: 9,
          produtoId: 101,
          quantidade: 2,
          valorUnitario: 199.9,
        },
      },
    });
    fixture.componentInstance.quantityChange.subscribe((v: number) => quantityChanges.push(v));
    fixture.componentInstance.remove.subscribe(() => {
      removeCalled = true;
    });

    expect(screen.getByText('Produto #101')).toBeVisible();
    expect(screen.getAllByText('R$ 399,80').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Diminuir quantidade' }));
    await user.click(screen.getByRole('button', { name: 'Remover' }));

    expect(quantityChanges).toEqual([1]);
    expect(removeCalled).toBe(true);
  });
});
