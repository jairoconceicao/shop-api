import { describe, expect, it } from 'vitest';

import { createEmptyLoginFormErrors, loginFormSchema } from './login-form.schema';

describe('loginFormSchema', () => {
  it('returns field errors for empty credentials', () => {
    const result = loginFormSchema.validate({
      email: '',
      senha: '',
      lembrarMe: false,
    });

    expect(result.success).toBe(false);
    expect(result.errors).toEqual({
      email: ['Informe seu e-mail.'],
      senha: ['Informe sua senha.'],
    });
  });

  it('validates email format and password length', () => {
    const result = loginFormSchema.validate({
      email: 'cliente@shopapi',
      senha: '1234567',
      lembrarMe: true,
    });

    expect(result.success).toBe(false);
    expect(result.errors.email).toEqual(['Informe um e-mail valido.']);
    expect(result.errors.senha).toEqual(['A senha deve ter pelo menos 8 caracteres.']);
  });

  it('accepts a valid login payload', () => {
    const result = loginFormSchema.validate({
      email: 'cliente@shopapi.dev',
      senha: '12345678',
      lembrarMe: true,
    });

    expect(result.success).toBe(true);
    expect(result.errors).toEqual(createEmptyLoginFormErrors());
  });
});
