export interface PasswordFormValue {
  senhaAtual: string;
  senhaNova: string;
  confirmacaoSenha: string;
}

export type PasswordFormField = 'senhaAtual' | 'senhaNova' | 'confirmacaoSenha';

export type PasswordFormErrors = Record<PasswordFormField, string[]>;

export interface PasswordFormValidationResult {
  success: boolean;
  errors: PasswordFormErrors;
}

export const passwordFormSchema = {
  validate(value: Partial<PasswordFormValue> | null | undefined): PasswordFormValidationResult {
    const errors = createEmptyPasswordFormErrors();
    const senhaAtual = normalizeText(value?.senhaAtual);
    const senhaNova = normalizeText(value?.senhaNova);
    const confirmacaoSenha = normalizeText(value?.confirmacaoSenha);

    validateSenhaAtual(errors, senhaAtual);
    validateSenhaNova(errors, senhaNova);
    validateConfirmacaoSenha(errors, senhaNova, confirmacaoSenha);

    return {
      success: Object.values(errors).every((messages) => messages.length === 0),
      errors,
    };
  },
} as const;

export function createEmptyPasswordFormErrors(): PasswordFormErrors {
  return {
    senhaAtual: [],
    senhaNova: [],
    confirmacaoSenha: [],
  };
}

export function createEmptyPasswordFormValue(): PasswordFormValue {
  return {
    senhaAtual: '',
    senhaNova: '',
    confirmacaoSenha: '',
  };
}

function validateSenhaAtual(errors: PasswordFormErrors, value: string): void {
  if (!value) {
    errors.senhaAtual.push('Informe sua senha atual.');
  }
}

function validateSenhaNova(errors: PasswordFormErrors, value: string): void {
  if (!value) {
    errors.senhaNova.push('Informe a nova senha.');
    return;
  }

  if (value.length < 8) {
    errors.senhaNova.push('A nova senha deve ter pelo menos 8 caracteres.');
  }
}

function validateConfirmacaoSenha(errors: PasswordFormErrors, senhaNova: string, value: string): void {
  if (!value) {
    errors.confirmacaoSenha.push('Confirme a nova senha.');
    return;
  }

  if (senhaNova && value !== senhaNova) {
    errors.confirmacaoSenha.push('A confirmacao da senha nao confere.');
  }
}

function normalizeText(value: string | null | undefined): string {
  return typeof value === 'string' ? value.trim() : '';
}
