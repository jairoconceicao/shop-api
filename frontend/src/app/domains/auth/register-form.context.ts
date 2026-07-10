export interface RegisterFormValue {
  nome: string;
  cpf: string;
  dataNascimento: string;
  email: string;
  senha: string;
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

export const registerFormUfOptions = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
] as const;

export function createEmptyRegisterFormValue(): RegisterFormValue {
  return {
    nome: '',
    cpf: '',
    dataNascimento: '',
    email: '',
    senha: '',
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
