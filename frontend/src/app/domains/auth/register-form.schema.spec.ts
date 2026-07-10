import { describe, expect, it } from 'vitest';

import { createEmptyRegisterFormValue } from './register-form.context';
import {
  createEmptyRegisterFormErrors,
  normalizeRegisterFormValue,
  registerFormSchema,
} from './register-form.schema';

describe('registerFormSchema', () => {
  it('returns field errors for an empty registration payload', () => {
    const result = registerFormSchema.validate(createEmptyRegisterFormValue());

    expect(result.success).toBe(false);
    expect(result.errors).toEqual({
      ...createEmptyRegisterFormErrors(),
      nome: ['Nome e obrigatorio.'],
      cpf: ['CPF e obrigatorio.'],
      dataNascimento: ['Data de nascimento e obrigatoria.'],
      email: ['Email e obrigatorio.'],
      senha: ['Senha e obrigatoria.'],
      logradouro: ['Logradouro e obrigatorio.'],
      numero: ['Numero e obrigatorio.'],
      complemento: [],
      cep: ['CEP e obrigatorio.'],
      bairro: ['Bairro e obrigatorio.'],
      cidade: ['Cidade e obrigatoria.'],
      uf: ['UF e obrigatoria.'],
      ddd: ['DDD e obrigatorio.'],
      telefone: ['Numero de celular e obrigatorio.'],
    });
  });

  it('validates cpf, email, date, uf and phone rules', () => {
    const futureDate = createFutureDateString();

    const result = registerFormSchema.validate({
      nome: 'Cliente Shop',
      cpf: '123.456.789-0a',
      dataNascimento: futureDate,
      email: 'cliente@shopapi',
      senha: '12345678',
      endereco: {
        logradouro: 'Rua Exemplo',
        numero: '123',
        complemento: 'Apto 10',
        cep: '0100-000',
        bairro: 'Centro',
        cidade: 'Sao Paulo',
        uf: 'XX',
      },
      celular: {
        ddd: '1',
        numero: '1234567',
        whatsApp: true,
      },
    });

    expect(result.success).toBe(false);
    expect(result.errors.cpf).toEqual(['CPF deve conter 11 digitos numericos.']);
    expect(result.errors.dataNascimento).toEqual(['Data de nascimento nao pode ser futura.']);
    expect(result.errors.email).toEqual(['Email deve ter um formato valido.']);
    expect(result.errors.cep).toEqual(['CEP deve conter 8 digitos numericos.']);
    expect(result.errors.uf).toEqual(['UF deve ser valida.']);
    expect(result.errors.ddd).toEqual(['DDD deve conter 2 digitos numericos.']);
    expect(result.errors.telefone).toEqual(['Numero de celular deve ter no minimo 8 digitos.']);
  });

  it('normalizes masked values before submission', () => {
    const normalized = normalizeRegisterFormValue({
      nome: '  Cliente Shop  ',
      cpf: '123.456.789-01',
      dataNascimento: '1990-01-31',
      email: ' cliente@shopapi.dev ',
      senha: '12345678',
      endereco: {
        logradouro: ' Rua Exemplo ',
        numero: ' 123 ',
        complemento: ' Apto 10 ',
        cep: '01000-000',
        bairro: ' Centro ',
        cidade: ' Sao Paulo ',
        uf: 'sp',
      },
      celular: {
        ddd: '(11)',
        numero: '(11) 99999-9999',
        whatsApp: true,
      },
    });

    expect(normalized).toEqual({
      nome: 'Cliente Shop',
      cpf: '12345678901',
      dataNascimento: '1990-01-31',
      email: 'cliente@shopapi.dev',
      senha: '12345678',
      endereco: {
        logradouro: 'Rua Exemplo',
        numero: '123',
        complemento: 'Apto 10',
        cep: '01000000',
        bairro: 'Centro',
        cidade: 'Sao Paulo',
        uf: 'SP',
      },
      celular: {
        ddd: '11',
        numero: '11999999999',
        whatsApp: true,
      },
    });
  });
});

function createFutureDateString(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);

  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
