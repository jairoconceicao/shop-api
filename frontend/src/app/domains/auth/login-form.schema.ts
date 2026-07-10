export interface LoginFormValue {
  email: string;
  senha: string;
  lembrarMe: boolean;
}

export type LoginFormField = 'email' | 'senha';

export type LoginFormErrors = Record<LoginFormField, string[]>;

export interface LoginFormValidationResult {
  success: boolean;
  errors: LoginFormErrors;
}

export const loginFormSchema = {
  validate(value: Partial<LoginFormValue> | null | undefined): LoginFormValidationResult {
    const errors = createEmptyLoginFormErrors();
    const email = normalizeText(value?.email);
    const senha = typeof value?.senha === 'string' ? value.senha : '';

    if (!email) {
      errors.email.push('Informe seu e-mail.');
    } else if (!isValidEmail(email)) {
      errors.email.push('Informe um e-mail valido.');
    }

    if (!senha) {
      errors.senha.push('Informe sua senha.');
    } else if (senha.length < 8) {
      errors.senha.push('A senha deve ter pelo menos 8 caracteres.');
    }

    return {
      success: errors.email.length === 0 && errors.senha.length === 0,
      errors,
    };
  },
} as const;

export function createEmptyLoginFormErrors(): LoginFormErrors {
  return {
    email: [],
    senha: [],
  };
}

export function normalizeLoginFormValue(value: LoginFormValue): LoginFormValue {
  return {
    email: normalizeText(value.email),
    senha: value.senha,
    lembrarMe: value.lembrarMe,
  };
}

function normalizeText(value: string | null | undefined): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
