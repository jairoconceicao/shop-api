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

  it('marks required fields and associates hint and error descriptions', async () => {
    await render(
      `
        <app-input
          label="Nome"
          [required]="true"
          hint="Use o nome cadastrado."
          error="Nome obrigatorio"
        />
      `,
      {
        imports: [InputComponent],
      },
    );

    const input = screen.getByRole('textbox');

    expect(screen.getByText('Nome')).toBeVisible();
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('aria-describedby');
    expect(screen.getByText('Use o nome cadastrado.')).toBeVisible();
    expect(screen.getByRole('alert')).toHaveTextContent('Nome obrigatorio');
  });
});
