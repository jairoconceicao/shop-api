import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

import { QuantitySelectorComponent } from './quantity-selector.component';

describe('QuantitySelectorComponent', () => {
  it('emits quantity changes when the controls are used', async () => {
    const user = userEvent.setup();
    const quantityChange = vi.fn();

    await render(QuantitySelectorComponent, {
      componentInputs: { quantity: 2 },
      componentOutputs: { quantityChange },
    });

    await user.click(screen.getByRole('button', { name: 'Diminuir quantidade' }));
    await user.click(screen.getByRole('button', { name: 'Aumentar quantidade' }));

    expect(quantityChange).toHaveBeenNthCalledWith(1, 1);
    expect(quantityChange).toHaveBeenNthCalledWith(2, 3);
  });
});
