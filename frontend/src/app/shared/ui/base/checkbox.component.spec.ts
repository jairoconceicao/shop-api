import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';

import { CheckboxComponent } from './checkbox.component';

describe('CheckboxComponent', () => {
  it('renders the checkbox and emits checked changes', async () => {
    const { fixture } = await render(CheckboxComponent, {
      componentProperties: {
        label: 'Lembrar-me',
        checked: false,
        hint: 'Mantem a sessao ativa neste dispositivo.',
      },
    });

    const checkbox = screen.getByLabelText('Lembrar-me') as HTMLInputElement;
    const emittedValues: boolean[] = [];

    fixture.componentInstance.checkedChange.subscribe((value) => emittedValues.push(value));

    expect(checkbox).not.toBeChecked();
    expect(screen.getByText('Mantem a sessao ativa neste dispositivo.')).toBeVisible();

    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));

    expect(emittedValues).toEqual([true]);
  });
});
