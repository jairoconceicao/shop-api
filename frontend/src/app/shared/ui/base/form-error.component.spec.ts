import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';

import { FormErrorComponent } from './form-error.component';

describe('FormErrorComponent', () => {
  it('renders multiple validation messages', async () => {
    await render(FormErrorComponent, {
      componentProperties: {
        error: ['Email obrigatorio', 'Email invalido'],
      },
    });

    const alert = screen.getByRole('alert');

    expect(alert).toBeVisible();
    expect(screen.getByText('Email obrigatorio')).toBeVisible();
    expect(screen.getByText('Email invalido')).toBeVisible();
  });
});
