export type CustomerAddress = {
  logradouro: string;
  numero: string;
  complemento: string | null;
  cep: string;
  bairro: string;
  cidade: string;
  uf: string;
};

export type CustomerCellphone = {
  ddd: string;
  numero: string;
  whatsApp: boolean;
};

export type CustomerDetail = {
  customerId: number;
  cpf: string;
  nome: string;
  dataNascimento: string;
  email: string;
  endereco: CustomerAddress;
  celular: CustomerCellphone;
};

export type CustomerFormDraft = {
  customerId: number;
  cpf: string;
  nome: string;
  dataNascimento: string;
  email: string;
  senha: string;
  logradouro: string;
  numero: string;
  complemento: string;
  cep: string;
  bairro: string;
  cidade: string;
  uf: string;
  ddd: string;
  numeroCelular: string;
  whatsApp: boolean;
};

export type CustomerIdResult = {
  customerId: number;
};
