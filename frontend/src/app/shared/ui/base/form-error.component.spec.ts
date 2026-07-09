import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';

import { FormErrorComponent } from './form-error.component';

describe('FormErrorComponent', () => {
  it('renders multiple validation messages', async () => {
    await render(
      `
        <app-form-error [error]="error" />
      `,
      {
        imports: [FormErrorComponent],
        componentProperties: {
          error: ['Email obrigatorio', 'Email invalido'],
        },
      },
    );

    const alert = screen.getByRole('alert');

    expect(alert).toBeVisible();
    expect(screen.getByText('Email obrigatorio')).toBeVisible();
    expect(screen.getByText('Email invalido')).toBeVisible();
  });

  it('renders a single validation message and stays hidden without errors', async () => {
    const { rerender } = await render(
      `
        <app-form-error [error]="error" />
      `,
      {
        imports: [FormErrorComponent],
        componentProperties: {
          error: 'Senha obrigatoria',
        },
      },
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Senha obrigatoria');

    await rerender({
      componentProperties: {
        error: null,
      },
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
