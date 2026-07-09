import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';

import { InputComponent } from './input.component';

describe('InputComponent', () => {
  it('renders label, hint and validation message and emits value changes', async () => {
    const { fixture } = await render(InputComponent, {
      componentProperties: {
        label: 'E-mail',
        value: 'cliente@shopapi.dev',
        hint: 'Use um e-mail valido para acesso.',
        error: 'E-mail obrigatorio',
      },
    });

    const input = screen.getByLabelText('E-mail') as HTMLInputElement;
    const emittedValues: string[] = [];

    fixture.componentInstance.valueChange.subscribe((value) => emittedValues.push(value));

    expect(input).toHaveValue('cliente@shopapi.dev');
    expect(screen.getByText('Use um e-mail valido para acesso.')).toBeVisible();
    expect(screen.getByRole('alert')).toHaveTextContent('E-mail obrigatorio');

    input.value = 'novo@shopapi.dev';
    input.dispatchEvent(new Event('input'));

    expect(emittedValues).toEqual(['novo@shopapi.dev']);
  });
});
