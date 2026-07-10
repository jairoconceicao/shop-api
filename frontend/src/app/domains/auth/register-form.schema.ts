import { registerFormUfOptions, type RegisterFormValue } from './register-form.context';

export type RegisterFormField =
  | 'nome'
  | 'cpf'
  | 'dataNascimento'
  | 'email'
  | 'senha'
  | 'logradouro'
  | 'numero'
  | 'complemento'
  | 'cep'
  | 'bairro'
  | 'cidade'
  | 'uf'
  | 'ddd'
  | 'telefone';

export type RegisterFormErrors = Record<RegisterFormField, string[]>;

export interface RegisterFormValidationResult {
  success: boolean;
  errors: RegisterFormErrors;
}

export const registerFormSchema = {
  validate(value: Partial<RegisterFormValue> | null | undefined): RegisterFormValidationResult {
    const errors = createEmptyRegisterFormErrors();
    const nome = normalizeText(value?.nome);
    const cpf = normalizeDigits(value?.cpf);
    const dataNascimento = normalizeText(value?.dataNascimento);
    const email = normalizeText(value?.email);
    const senha = typeof value?.senha === 'string' ? value.senha : '';
    const logradouro = normalizeText(value?.endereco?.logradouro);
    const numero = normalizeText(value?.endereco?.numero);
    const complemento = normalizeText(value?.endereco?.complemento);
    const cep = normalizeDigits(value?.endereco?.cep);
    const bairro = normalizeText(value?.endereco?.bairro);
    const cidade = normalizeText(value?.endereco?.cidade);
    const uf = normalizeText(value?.endereco?.uf).toUpperCase();
    const ddd = normalizeDigits(value?.celular?.ddd);
    const telefone = normalizeDigits(value?.celular?.numero);

    validateNome(errors, nome);
    validateCpf(errors, cpf);
    validateDataNascimento(errors, dataNascimento);
    validateEmail(errors, email);
    validateSenha(errors, senha);
    validateLogradouro(errors, logradouro);
    validateNumero(errors, numero);
    validateComplemento(errors, complemento);
    validateCep(errors, cep);
    validateBairro(errors, bairro);
    validateCidade(errors, cidade);
    validateUf(errors, uf);
    validateDdd(errors, ddd);
    validateTelefone(errors, telefone);

    return {
      success: Object.values(errors).every((messages) => messages.length === 0),
      errors,
    };
  },
} as const;

export function createEmptyRegisterFormErrors(): RegisterFormErrors {
  return {
    nome: [],
    cpf: [],
    dataNascimento: [],
    email: [],
    senha: [],
    logradouro: [],
    numero: [],
    complemento: [],
    cep: [],
    bairro: [],
    cidade: [],
    uf: [],
    ddd: [],
    telefone: [],
  };
}

export function normalizeRegisterFormValue(value: RegisterFormValue): RegisterFormValue {
  return {
    nome: normalizeText(value.nome),
    cpf: normalizeDigits(value.cpf),
    dataNascimento: normalizeText(value.dataNascimento),
    email: normalizeText(value.email),
    senha: value.senha,
    endereco: {
      logradouro: normalizeText(value.endereco.logradouro),
      numero: normalizeText(value.endereco.numero),
      complemento: normalizeText(value.endereco.complemento),
      cep: normalizeDigits(value.endereco.cep),
      bairro: normalizeText(value.endereco.bairro),
      cidade: normalizeText(value.endereco.cidade),
      uf: normalizeText(value.endereco.uf).toUpperCase(),
    },
    celular: {
      ddd: normalizeDigits(value.celular.ddd),
      numero: normalizeDigits(value.celular.numero),
      whatsApp: value.celular.whatsApp,
    },
  };
}

function validateNome(errors: RegisterFormErrors, value: string): void {
  if (!value) {
    errors.nome.push('Nome e obrigatorio.');
    return;
  }

  if (value.length > 200) {
    errors.nome.push('Nome deve ter no maximo 200 caracteres.');
  }
}

function validateCpf(errors: RegisterFormErrors, value: string): void {
  if (!value) {
    errors.cpf.push('CPF e obrigatorio.');
    return;
  }

  if (!/^\d{11}$/.test(value)) {
    errors.cpf.push('CPF deve conter 11 digitos numericos.');
  }
}

function validateDataNascimento(errors: RegisterFormErrors, value: string): void {
  if (!value) {
    errors.dataNascimento.push('Data de nascimento e obrigatoria.');
    return;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    errors.dataNascimento.push('Data de nascimento deve ter um formato valido.');
    return;
  }

  if (value > toLocalDateString(new Date())) {
    errors.dataNascimento.push('Data de nascimento nao pode ser futura.');
  }
}

function validateEmail(errors: RegisterFormErrors, value: string): void {
  if (!value) {
    errors.email.push('Email e obrigatorio.');
    return;
  }

  if (!isValidEmail(value)) {
    errors.email.push('Email deve ter um formato valido.');
  } else if (value.length > 200) {
    errors.email.push('Email deve ter no maximo 200 caracteres.');
  }
}

function validateSenha(errors: RegisterFormErrors, value: string): void {
  if (!value) {
    errors.senha.push('Senha e obrigatoria.');
    return;
  }

  if (value.length < 8) {
    errors.senha.push('Senha deve ter no minimo 8 caracteres.');
  }

  if (value.length > 200) {
    errors.senha.push('Senha deve ter no maximo 200 caracteres.');
  }
}

function validateLogradouro(errors: RegisterFormErrors, value: string): void {
  if (!value) {
    errors.logradouro.push('Logradouro e obrigatorio.');
    return;
  }

  if (value.length > 200) {
    errors.logradouro.push('Logradouro deve ter no maximo 200 caracteres.');
  }
}

function validateNumero(errors: RegisterFormErrors, value: string): void {
  if (!value) {
    errors.numero.push('Numero e obrigatorio.');
    return;
  }

  if (value.length > 50) {
    errors.numero.push('Numero deve ter no maximo 50 caracteres.');
  }
}

function validateComplemento(errors: RegisterFormErrors, value: string): void {
  if (value.length > 200) {
    errors.complemento.push('Complemento deve ter no maximo 200 caracteres.');
  }
}

function validateCep(errors: RegisterFormErrors, value: string): void {
  if (!value) {
    errors.cep.push('CEP e obrigatorio.');
    return;
  }

  if (!/^\d{8}$/.test(value)) {
    errors.cep.push('CEP deve conter 8 digitos numericos.');
  }
}

function validateBairro(errors: RegisterFormErrors, value: string): void {
  if (!value) {
    errors.bairro.push('Bairro e obrigatorio.');
    return;
  }

  if (value.length > 100) {
    errors.bairro.push('Bairro deve ter no maximo 100 caracteres.');
  }
}

function validateCidade(errors: RegisterFormErrors, value: string): void {
  if (!value) {
    errors.cidade.push('Cidade e obrigatoria.');
    return;
  }

  if (value.length > 100) {
    errors.cidade.push('Cidade deve ter no maximo 100 caracteres.');
  }
}

function validateUf(errors: RegisterFormErrors, value: string): void {
  if (!value) {
    errors.uf.push('UF e obrigatoria.');
    return;
  }

  if (!registerFormUfOptions.includes(value as (typeof registerFormUfOptions)[number])) {
    errors.uf.push('UF deve ser valida.');
  }
}

function validateDdd(errors: RegisterFormErrors, value: string): void {
  if (!value) {
    errors.ddd.push('DDD e obrigatorio.');
    return;
  }

  if (!/^\d{2}$/.test(value)) {
    errors.ddd.push('DDD deve conter 2 digitos numericos.');
  }
}

function validateTelefone(errors: RegisterFormErrors, value: string): void {
  if (!value) {
    errors.telefone.push('Numero de celular e obrigatorio.');
    return;
  }

  if (value.length < 8) {
    errors.telefone.push('Numero de celular deve ter no minimo 8 digitos.');
  }

  if (value.length > 30) {
    errors.telefone.push('Numero de celular deve ter no maximo 30 caracteres.');
  }
}

function normalizeText(value: string | null | undefined): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeDigits(value: string | null | undefined): string {
  return normalizeText(value).replace(/\D+/g, '');
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function toLocalDateString(date: Date): string {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
