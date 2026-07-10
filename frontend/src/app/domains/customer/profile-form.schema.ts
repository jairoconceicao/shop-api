import type { CustomerUpdateRequest } from '@shared/models';

export interface ProfileFormValue {
  cpf: string;
  nome: string;
  dataNascimento: string;
  email: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento: string;
    cep: string;
    bairro: string;
    cidade: string;
    uf: string;
  };
  celular: {
    ddd: string;
    numero: string;
    whatsApp: boolean;
  };
}

export type ProfileFormField =
  | 'cpf'
  | 'nome'
  | 'dataNascimento'
  | 'email'
  | 'logradouro'
  | 'numero'
  | 'complemento'
  | 'cep'
  | 'bairro'
  | 'cidade'
  | 'uf'
  | 'ddd'
  | 'telefone';

export type ProfileFormErrors = Record<ProfileFormField, string[]>;

export interface ProfileFormValidationResult {
  success: boolean;
  errors: ProfileFormErrors;
}

export const profileFormSchema = {
  validate(value: Partial<ProfileFormValue> | null | undefined): ProfileFormValidationResult {
    const errors = createEmptyProfileFormErrors();
    const cpf = normalizeDigits(value?.cpf);
    const nome = normalizeText(value?.nome);
    const dataNascimento = normalizeText(value?.dataNascimento);
    const email = normalizeText(value?.email);
    const logradouro = normalizeText(value?.endereco?.logradouro);
    const numero = normalizeText(value?.endereco?.numero);
    const complemento = normalizeText(value?.endereco?.complemento);
    const cep = normalizeDigits(value?.endereco?.cep);
    const bairro = normalizeText(value?.endereco?.bairro);
    const cidade = normalizeText(value?.endereco?.cidade);
    const uf = normalizeText(value?.endereco?.uf).toUpperCase();
    const ddd = normalizeDigits(value?.celular?.ddd);
    const telefone = normalizeDigits(value?.celular?.numero);

    validateCpf(errors, cpf);
    validateNome(errors, nome);
    validateDataNascimento(errors, dataNascimento);
    validateEmail(errors, email);
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

export function createEmptyProfileFormErrors(): ProfileFormErrors {
  return {
    cpf: [],
    nome: [],
    dataNascimento: [],
    email: [],
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

export function createEmptyProfileFormValue(): ProfileFormValue {
  return {
    cpf: '',
    nome: '',
    dataNascimento: '',
    email: '',
    endereco: {
      logradouro: '',
      numero: '',
      complemento: '',
      cep: '',
      bairro: '',
      cidade: '',
      uf: '',
    },
    celular: {
      ddd: '',
      numero: '',
      whatsApp: false,
    },
  };
}

export function normalizeProfileFormValue(value: ProfileFormValue): CustomerUpdateRequest {
  return {
    cpf: normalizeDigits(value.cpf),
    nome: normalizeText(value.nome),
    dataNascimento: normalizeText(value.dataNascimento) as CustomerUpdateRequest['dataNascimento'],
    email: normalizeText(value.email),
    endereco: {
      logradouro: normalizeText(value.endereco.logradouro),
      numero: normalizeText(value.endereco.numero),
      complemento: normalizeNullableText(value.endereco.complemento),
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

function validateCpf(errors: ProfileFormErrors, value: string): void {
  if (!value) {
    errors.cpf.push('Informe o CPF.');
    return;
  }

  if (!/^\d{11}$/.test(value)) {
    errors.cpf.push('CPF deve conter 11 digitos numericos.');
  }
}

function validateNome(errors: ProfileFormErrors, value: string): void {
  if (!value) {
    errors.nome.push('Informe o nome completo.');
  }
}

function validateDataNascimento(errors: ProfileFormErrors, value: string): void {
  if (!value) {
    errors.dataNascimento.push('Informe a data de nascimento.');
    return;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    errors.dataNascimento.push('Informe uma data de nascimento valida.');
  }
}

function validateEmail(errors: ProfileFormErrors, value: string): void {
  if (!value) {
    errors.email.push('Informe um e-mail valido.');
    return;
  }

  if (!isValidEmail(value)) {
    errors.email.push('Informe um e-mail valido.');
  }
}

function validateLogradouro(errors: ProfileFormErrors, value: string): void {
  if (!value) {
    errors.logradouro.push('Informe o logradouro.');
  }
}

function validateNumero(errors: ProfileFormErrors, value: string): void {
  if (!value) {
    errors.numero.push('Informe o numero.');
  }
}

function validateComplemento(errors: ProfileFormErrors, value: string): void {
  if (value.length > 200) {
    errors.complemento.push('Complemento deve ter no maximo 200 caracteres.');
  }
}

function validateCep(errors: ProfileFormErrors, value: string): void {
  if (!value) {
    errors.cep.push('Informe o CEP.');
    return;
  }

  if (!/^\d{8}$/.test(value)) {
    errors.cep.push('CEP deve conter 8 digitos numericos.');
  }
}

function validateBairro(errors: ProfileFormErrors, value: string): void {
  if (!value) {
    errors.bairro.push('Informe o bairro.');
  }
}

function validateCidade(errors: ProfileFormErrors, value: string): void {
  if (!value) {
    errors.cidade.push('Informe a cidade.');
  }
}

function validateUf(errors: ProfileFormErrors, value: string): void {
  if (!value) {
    errors.uf.push('Informe a UF.');
    return;
  }

  if (!/^[A-Z]{2}$/.test(value)) {
    errors.uf.push('UF deve ser valida.');
  }
}

function validateDdd(errors: ProfileFormErrors, value: string): void {
  if (!value) {
    errors.ddd.push('Informe o DDD.');
    return;
  }

  if (!/^\d{2}$/.test(value)) {
    errors.ddd.push('DDD deve conter 2 digitos numericos.');
  }
}

function validateTelefone(errors: ProfileFormErrors, value: string): void {
  if (!value) {
    errors.telefone.push('Informe o telefone celular.');
    return;
  }

  if (value.length < 8) {
    errors.telefone.push('Numero de celular deve ter no minimo 8 digitos.');
  }
}

function normalizeText(value: string | null | undefined): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeDigits(value: string | null | undefined): string {
  return normalizeText(value).replace(/\D+/g, '');
}

function normalizeNullableText(value: string | null | undefined): string | null {
  const normalized = normalizeText(value);
  return normalized ? normalized : null;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
