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

  it('links hint and error messages and emits blur events', async () => {
    const blurredEvents: number[] = [];

    await render(
      `
        <app-checkbox
          label="Aceito os termos"
          [required]="true"
          hint="Leia os termos antes de continuar."
          error="Aceite os termos para seguir."
          (blurred)="onBlur()"
        />
      `,
      {
        imports: [CheckboxComponent],
        componentProperties: {
          onBlur: () => blurredEvents.push(1),
        },
      },
    );

    const checkbox = screen.getByRole('checkbox');

    expect(checkbox).toBeRequired();
    expect(checkbox).toHaveClass('focus-visible:ring-2');
    expect(checkbox).toHaveAttribute('aria-describedby');
    expect(screen.getByText('Leia os termos antes de continuar.')).toBeVisible();
    expect(screen.getByRole('alert')).toHaveTextContent('Aceite os termos para seguir.');

    checkbox.dispatchEvent(new Event('blur'));

    expect(blurredEvents).toEqual([1]);
  });
});
