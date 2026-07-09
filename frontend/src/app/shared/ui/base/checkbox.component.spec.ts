import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';

import { CheckboxComponent } from './checkbox.component';

describe('CheckboxComponent', () => {
  it('renders the checkbox and emits checked changes', async () => {
    const emittedValues: boolean[] = [];

    const { fixture } = await render(
      `
        <app-checkbox
          label="Lembrar-me"
          [checked]="checked"
          hint="Mantem a sessao ativa neste dispositivo."
          (checkedChange)="onChecked($event)"
        />
      `,
      {
        imports: [CheckboxComponent],
        componentProperties: {
          checked: false,
          onChecked: (value: boolean) => emittedValues.push(value),
        },
      },
    );

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;

    expect(checkbox).not.toBeChecked();
    expect(screen.getByText('Mantem a sessao ativa neste dispositivo.')).toBeVisible();

    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(emittedValues).toEqual([true]);
  });
});
