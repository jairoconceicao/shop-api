import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';

import { InputComponent } from './input.component';

describe('InputComponent', () => {
  it('renders label, hint and validation message and emits value changes', async () => {
    const emittedValues: string[] = [];

    const { fixture } = await render(
      `
        <app-input
          label="E-mail"
          [value]="value"
          hint="Use um e-mail valido para acesso."
          error="E-mail obrigatorio"
          (valueChange)="onValueChange($event)"
        />
      `,
      {
        imports: [InputComponent],
        componentProperties: {
          value: 'cliente@shopapi.dev',
          onValueChange: (val: string) => emittedValues.push(val),
        },
      },
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;

    expect(input).toHaveValue('cliente@shopapi.dev');
    expect(screen.getByText('Use um e-mail valido para acesso.')).toBeVisible();
    expect(screen.getByRole('alert')).toHaveTextContent('E-mail obrigatorio');

    input.value = 'novo@shopapi.dev';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(emittedValues).toEqual(['novo@shopapi.dev']);
  });
});
