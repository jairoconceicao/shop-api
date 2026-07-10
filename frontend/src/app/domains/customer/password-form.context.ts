export interface PasswordFormValue {
  senhaAtual: string;
  senhaNova: string;
  confirmacaoSenha: string;
}

export function createEmptyPasswordFormValue(): PasswordFormValue {
  return {
    senhaAtual: '',
    senhaNova: '',
    confirmacaoSenha: '',
  };
}
