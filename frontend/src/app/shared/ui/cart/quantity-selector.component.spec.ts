import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

import { QuantitySelectorComponent } from './quantity-selector.component';

describe('QuantitySelectorComponent', () => {
  it('emits quantity changes when the controls are used', async () => {
    const user = userEvent.setup();
    const emitted: number[] = [];

    const { fixture } = await render(QuantitySelectorComponent, {
      componentInputs: { quantity: 2 },
    });
    fixture.componentInstance.quantityChange.subscribe((v: number) => emitted.push(v));

    await user.click(screen.getByRole('button', { name: 'Diminuir quantidade' }));
    await user.click(screen.getByRole('button', { name: 'Aumentar quantidade' }));

    expect(emitted).toEqual([1, 3]);
  });
});
