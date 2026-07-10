import { describe, expect, it } from 'vitest';

import {
  createEmptyPasswordFormErrors,
  createEmptyPasswordFormValue,
  passwordFormSchema,
} from './password-form.schema';

describe('passwordFormSchema', () => {
  it('returns field errors for empty password fields', () => {
    const result = passwordFormSchema.validate(createEmptyPasswordFormValue());

    expect(result.success).toBe(false);
    expect(result.errors).toEqual({
      ...createEmptyPasswordFormErrors(),
      senhaAtual: ['Informe sua senha atual.'],
      senhaNova: ['Informe a nova senha.'],
      confirmacaoSenha: ['Confirme a nova senha.'],
    });
  });

  it('validates minimum length and password confirmation', () => {
    const result = passwordFormSchema.validate({
      senhaAtual: '12345678',
      senhaNova: '1234567',
      confirmacaoSenha: '12345678',
    });

    expect(result.success).toBe(false);
    expect(result.errors.senhaNova).toEqual(['A nova senha deve ter pelo menos 8 caracteres.']);
    expect(result.errors.confirmacaoSenha).toEqual(['A confirmacao da senha nao confere.']);
  });

  it('accepts a valid password payload', () => {
    const result = passwordFormSchema.validate({
      senhaAtual: '12345678',
      senhaNova: '12345678',
      confirmacaoSenha: '12345678',
    });

    expect(result.success).toBe(true);
    expect(result.errors).toEqual(createEmptyPasswordFormErrors());
  });
});
